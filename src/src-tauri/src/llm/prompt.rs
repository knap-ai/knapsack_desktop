use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::types::{Message, MessageSender};
use crate::db::models::document::{convert_ids_to_knowledge, Document};
use crate::db::models::message::Message as DbMessage;
use crate::memory::semantic::SemanticService;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct AdditionalDocument {
  pub title: String,
  pub content: String,
  pub doc_type: Option<String>,
}

pub fn parse_messages(messages: Vec<DbMessage>) -> Vec<Message> {
  messages
    .into_iter()
    .map(|message| Message {
      sender: if message.user_id.is_some() {
        MessageSender::User
      } else {
        MessageSender::Bot
      },
      content: message.content,
    })
    .collect()
}

pub async fn build_user_message(
  prompt: String,
  semantic_search_query: Option<String>,
  filter_documents: Option<Vec<Document>>,
  semantic_service: Arc<Mutex<Option<SemanticService>>>,
  additional_documents: Option<Vec<AdditionalDocument>>,
) -> Message {
  let mut user_prompt: String = prompt.clone();
  let mut total_doc_knowledge = "".to_string();

  // let max_context_length: u64 = get_max_context_length();
  // let maybe_locked_semantic_service = semantic_service.lock().await;
  // let locked_semantic_service = maybe_locked_semantic_service.as_ref().unwrap();
  // let mut ss_results = Vec::new();
  // if semantic_search_query.is_some() {
  //   ss_results = match locked_semantic_service
  //     .semantic_search(
  //       semantic_search_query.unwrap(),
  //       5,
  //       None,
  //       None,
  //       Some(false),
  //       Some(false),
  //       filter_documents.clone(),
  //     )
  //     .await
  //   {
  //     Ok(ss) => ss,
  //     Err(e) => {
  //       log::error!("------------- ss fail: {:?}", e);
  //       Vec::new()
  //     }
  //   };
  // }

  for additional_document in additional_documents.unwrap_or(vec![]) {
    // println!("############# ADDITIONAL DOC: {:?}", additional_document);
    if additional_document.doc_type.is_some() && additional_document.doc_type.unwrap() == "transcript".to_string() {
    }
    total_doc_knowledge.push_str(&format!(
      "\n> Start of document: {}\n{}\n> End of document: {}\n",
      additional_document.title, additional_document.content, additional_document.title
    ));
  }

  // for ss_result in &ss_results {
  //   let knowledge = convert_ids_to_knowledge(
  //     ss_result.document_id,
  //     Some(ss_result.chunk_ids.clone()),
  //     Some(ss_result.payloads.clone()),
  //   )
  //   .unwrap_or_else(|_| {
  //     log::error!(
  //       "Could not convert ids to knowledge for document_id: {}",
  //       ss_result.document_id
  //     );
  //     String::new()
  //   });
  //   total_doc_knowledge.push_str(&knowledge);
  // }

  if total_doc_knowledge.len() > 0 {
    user_prompt = format!(
      "Use this context from my documents to respond to me: {}\n\n{}",
      total_doc_knowledge, user_prompt
    );
  }

  user_prompt = format!("{} Be informative but not wordy. Respond succintly. Give your entire response in Markdown, so that I can display it nicely.", user_prompt);

  // Save prompt to debug file
  if let Some(home_dir) = dirs::home_dir() {
    let debug_path = home_dir.join(".knapsack").join("debug_user_prompt.txt");
    if let Err(e) = fs::write(&debug_path, &user_prompt) {
      log::error!("Failed to write debug prompt file: {}", e);
    }
  }

  Message {
    sender: MessageSender::User,
    content: user_prompt,
  }
}

pub fn build_system_message(user_name: String, user_email: String) -> Message {
  Message {
    sender: MessageSender::System,
    content: format!("You are a highly precise executive assistant to me, {} (my email is {}). Your primary focus is capturing and organizing concrete information from meetings:

Your writing style is:
- Direct and factual
- Focused on specifics over generalities
- Numbers and metrics driven
- Properly capitalized for all proper nouns
- Organized and hierarchical

You strictly avoid:
- Generalizations where specific details were given
- Paraphrasing numbers or metrics
- Omitting pricing details
- Dropping proper noun capitalization
- Making assumptions about unclear information

When writing drafts of emails for me, try to match the tone of the conversation.
", user_name, user_email ),
  }
}
