use text_splitter::{ChunkConfig, TextSplitter as TextSplitterPackage};

const DEFAULT_CHUNK_SIZE: usize = 600;
const DEFAULT_CHUNK_OVERLAP: usize = 50;

pub struct TextSplitter {
  chunk_size: usize,
  chunk_overlap: usize,
  separators: Vec<&'static str>,
}

impl Default for TextSplitter {
  fn default() -> Self {
    TextSplitter {
      chunk_size: DEFAULT_CHUNK_SIZE,
      chunk_overlap: DEFAULT_CHUNK_OVERLAP,
      separators: vec!["\n\n", "\n", ". ", "! ", "? ", ";", ":", ", ", " ", ""],
    }
  }
}

impl TextSplitter {
  pub fn split_text(&self, text: &str) -> Vec<String> {
    let config = ChunkConfig::new(self.chunk_size)
      .with_overlap(self.chunk_overlap)
      .unwrap()
      .with_trim(true);
    let splitter = TextSplitterPackage::new(config);
    splitter
      .chunks(&text)
      .into_iter()
      .map(|item| String::from(item))
      .collect::<Vec<_>>()
  }
}
//     let mut chunks = Vec::new();
//     let mut text_to_split = text;
//     while !text_to_split.is_empty() {
//       let (chunk, remainder) = self.split_chunk(&text_to_split);
//       chunks.push(chunk);
//       text_to_split = remainder;
//     }

//     chunks
//   }

//   fn split_chunk<'a>(&self, text: &'a str) -> (String, String) {
//     if text.len() <= self.chunk_size {
//       return (text.to_string(), "".to_string());
//     }
//     let mut best_end = self.chunk_size;
//     let mut found_separator = false;

//     for separator in &self.separators {
//       let mut window_end = std::cmp::min(text.len() - 1, self.chunk_size + separator.len());
//       window_end = text.char_indices()
//         .nth(window_end)
//         .map(|(idx, _)| idx)
//         .unwrap_or(text.len());

//       let window = &text.chars().take(window_end).collect::<String>();

//       if let Some(last_separator) = window.rfind(separator) {
//         if last_separator > 0 && last_separator > self.chunk_overlap {
//           best_end = last_separator + separator.len();
//           found_separator = true;
//           break;
//         }
//       }
//     }

//     if !found_separator {
//       best_end = text.char_indices()
//         .nth(self.chunk_size)
//         .map(|(idx, _)| idx)
//         .unwrap_or(text.len());
//     } else {
//       best_end = text.char_indices()
//         .nth(best_end)
//         .map(|(idx, _)| idx)
//         .unwrap_or(text.len());
//       if best_end > self.chunk_size {
//         best_end = self.chunk_size;
//       }
//     }

//     let chunk = text.chars().take(best_end).collect::<String>();

//     let start_index = best_end.saturating_sub(self.chunk_overlap);
//     let start_index = text.char_indices().nth(start_index).map(|(idx, _)| idx).unwrap_or(0);
//     let remainder = text.chars().skip(start_index).collect::<String>();

//     (chunk, remainder)
//   }
// }
