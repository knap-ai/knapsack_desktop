use crate::llm::types::{Message, MessageSender};

#[derive(Clone, Copy)]
pub enum ChatFormat {
  Llama3,
  // Mistral,
  // Gemma,
  // Phi3,
  // Default,
}

pub fn apply_llama3_chat_format_template(messages: Vec<Message>) -> String {
  let mut full_prompt = String::new();
  for message in messages {
    match message.sender {
      MessageSender::User => {
        full_prompt.push_str(&format!(
          "\n<|start_header_id|>user<|end_header_id|>{}<|eot_id|>",
          message.content
        ));
      }
      MessageSender::Bot => {
        full_prompt.push_str(&format!(
          "\n<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n{}\n<|eot_id|>",
          message.content
        ));
      }
      MessageSender::System => {
        full_prompt.push_str(&format!(
          "\n<|begin_of_text|><|start_header_id|>system<|end_header_id|>{}<|eot_id|>",
          message.content
        ));
      }
    }
  }
  full_prompt
}

pub fn apply_chat_template(messages: Vec<Message>, chat_format: ChatFormat) -> String {
  match chat_format {
    ChatFormat::Llama3 => apply_llama3_chat_format_template(messages),
    _ => format!(""),
  }
}
