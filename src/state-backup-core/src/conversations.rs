//! Domain-separated authenticated conversation envelopes; no filesystem/execution state.
use super::*;
const MAGIC: &[u8;8] = b"KNCONV01";
pub const MAX_CONVERSATION_BYTES: usize = 256*1024;
const HEADER:usize=32;

fn context(account:&str, conversation:&str, revision:u64, version:&str)->Result<Vec<u8>> {
  account_id(account)?;
  if conversation.len()!=36 || version.len()!=36 || revision==0 || revision>9_007_199_254_740_991 {return Err(Error::InvalidSchema)}
  serde_json::to_vec(&("knapsack-account-conversation-v1",account,conversation,revision,version)).map_err(|_|Error::InvalidSchema)
}

pub fn seal_conversation(plaintext:&[u8], key:&RecoveryKey, account:&str, conversation:&str, revision:u64, version:&str)->Result<Vec<u8>> {
  if plaintext.len()+HEADER+16>MAX_CONVERSATION_BYTES {return Err(Error::Bounds)}
  secrets::check(std::str::from_utf8(plaintext).map_err(|_|Error::InvalidSchema)?)?;
  let aad=context(account,conversation,revision,version)?;
  let mut nonce=[0u8;24];getrandom::getrandom(&mut nonce).map_err(|_|Error::Io("Secure randomness unavailable"))?;
  let cipher=XChaCha20Poly1305::new_from_slice(key.0.as_ref()).map_err(|_|Error::InvalidKey)?;
  let ciphertext=cipher.encrypt(XNonce::from_slice(&nonce),Payload{msg:plaintext,aad:&aad}).map_err(|_|Error::Authentication)?;
  let mut envelope=Vec::with_capacity(HEADER+ciphertext.len());envelope.extend(MAGIC);envelope.extend(nonce);envelope.extend(ciphertext);Ok(envelope)
}

pub fn open_conversation(envelope:&[u8],key:&RecoveryKey,account:&str,conversation:&str,revision:u64,version:&str)->Result<Zeroizing<Vec<u8>>> {
  if envelope.len()<HEADER+16 || envelope.len()>MAX_CONVERSATION_BYTES || &envelope[..8]!=MAGIC {return Err(Error::InvalidArchive)}
  let aad=context(account,conversation,revision,version)?;
  let cipher=XChaCha20Poly1305::new_from_slice(key.0.as_ref()).map_err(|_|Error::InvalidKey)?;
  let bytes=Zeroizing::new(cipher.decrypt(XNonce::from_slice(&envelope[8..HEADER]),Payload{msg:&envelope[HEADER..],aad:&aad}).map_err(|_|Error::Authentication)?);
  secrets::check(std::str::from_utf8(&bytes).map_err(|_|Error::InvalidSchema)?)?;Ok(bytes)
}

#[cfg(test)] mod tests {
 use super::*;
 #[test] fn conversation_ciphertext_binds_every_authority_dimension_and_has_fresh_nonces(){
  let key=RecoveryKey::generate().unwrap();let id="11111111-1111-4111-8111-111111111111";let version="22222222-2222-4222-8222-222222222222";
  let first=seal_conversation(b"reviewed conversation text",&key,"owner-one",id,1,version).unwrap();
  assert_eq!(&*open_conversation(&first,&key,"owner-one",id,1,version).unwrap(),b"reviewed conversation text");
  assert_ne!(first,seal_conversation(b"reviewed conversation text",&key,"owner-one",id,1,version).unwrap());
  for (account,record,revision,key_version) in [("owner-two",id,1,version),("owner-one",version,1,version),("owner-one",id,2,version),("owner-one",id,1,id)] {
   assert!(open_conversation(&first,&key,account,record,revision,key_version).is_err());
  }
  assert!(open_conversation(&first,&RecoveryKey::generate().unwrap(),"owner-one",id,1,version).is_err());
  let mut damaged=first.clone();let last=damaged.len()-1;damaged[last]^=1;assert!(open_conversation(&damaged,&key,"owner-one",id,1,version).is_err());
 }
 #[test] fn conversation_envelopes_reject_secrets_and_oversized_state(){
  let key=RecoveryKey::generate().unwrap();let id="11111111-1111-4111-8111-111111111111";
  assert_eq!(seal_conversation(b"password=do-not-upload-this",&key,"owner",id,1,id),Err(Error::SecretDetected));
  assert_eq!(seal_conversation(&vec![b'x';MAX_CONVERSATION_BYTES],&key,"owner",id,1,id),Err(Error::Bounds));
 }
}
