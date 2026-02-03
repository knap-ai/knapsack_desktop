use crate::error::{
  handle_qdrant_request_error, BaseQdrantResponse, CustomQdrantError, QdrantError,
};
use crate::server::qdrant::{get_qdrant_logfile, QDRANT_PORT};
use reqwest::{self, Client};
use serde::Deserialize;
use serde_json::{json, Map, Number, Value};
use std::collections::HashMap;
use std::io::Write;

const COLLECTION_NAME: &str = "knapsack";

fn get_qdrant_base_url() -> String {
  format!("http://localhost:{}", QDRANT_PORT)
}

pub async fn create_collection() -> Result<(), QdrantError> {
  let mut qdrant_log_file = get_qdrant_logfile();

  let mut vectors_map = Map::new();
  vectors_map.insert("size".to_string(), Value::Number(Number::from(1024)));
  vectors_map.insert("distance".to_string(), Value::String("Cosine".to_string()));
  let mut json = Map::new();
  json.insert("vectors".to_string(), Value::Object(vectors_map));
  let client = Client::new();
  let result = client
    .put(format!(
      "{}/collections/{}",
      get_qdrant_base_url(),
      COLLECTION_NAME
    ))
    .json(&json)
    .send()
    .await;

  match result {
    Ok(response) => {
      let json = response.json::<BaseQdrantResponse>().await.unwrap();
      if json.status.is_string() && json.status.as_str().unwrap() == String::from("ok") {
        return Ok(());
      }
      if json.status.is_string() {
        let _ = writeln!(
          qdrant_log_file,
          "Error creating collection: {}",
          json.status.as_str().unwrap()
        );
      }
      return Err(QdrantError::ActionError(CustomQdrantError::new(
        "Creating collection failed",
      )));
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

pub async fn delete_knapsack_collection() -> Result<(), QdrantError> {
  let mut qdrant_log_file = get_qdrant_logfile();

  let client = Client::new();
  let result = client
    .delete(format!(
      "{}/collections/{}",
      get_qdrant_base_url(),
      COLLECTION_NAME
    ))
    .send()
    .await;
  match result {
    Ok(response) => {
      let json = response.json::<BaseQdrantResponse>().await.unwrap();
      if json.status.is_string() && json.status.as_str().unwrap() == String::from("ok") {
        return Ok(());
      }
      if json.status.is_string() {
        let _ = writeln!(
          qdrant_log_file,
          "Error deleting collection: {}",
          json.status.as_str().unwrap()
        );
      }
      return Err(QdrantError::ActionError(CustomQdrantError::new(
        "Deleting collection failed",
      )));
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

pub async fn delete_points_with_base_id(ids: Vec<String>) -> Result<(), QdrantError> {
  let mut qdrant_log_file = get_qdrant_logfile();

  let mut json = Map::new();
  let mut filter_value = Map::new();
  let mut must_item = Map::new();
  must_item.insert("key".to_string(), Value::String("base_id".to_string()));
  let mut match_value = Map::new();
  let any_value: Value = ids.into_iter().collect();
  match_value.insert("any".to_string(), any_value);
  must_item.insert("match".to_string(), Value::Object(match_value));
  let must_value: Value = vec![must_item].into_iter().collect();
  filter_value.insert("must".to_string(), must_value);
  json.insert("filter".to_string(), Value::Object(filter_value));

  let client = Client::new();
  let result = client
    .post(format!(
      "{}/collections/{}/points/delete",
      get_qdrant_base_url(),
      COLLECTION_NAME
    ))
    .json(&json)
    .send()
    .await;
  match result {
    Ok(response) => {
      let json: BaseQdrantResponse = response.json::<BaseQdrantResponse>().await.unwrap();
      if json.status.is_string() && json.status.as_str().unwrap() == String::from("ok") {
        return Ok(());
      }
      if json.status.is_string() {
        let _ = writeln!(
          qdrant_log_file,
          "Knapsack - error deleting points: {}",
          json.status.as_str().unwrap()
        );
      }
      return Err(QdrantError::ActionError(CustomQdrantError::new(
        "Deleting points failed",
      )));
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

pub async fn upsert_points(
  ids: Vec<String>,
  payloads: Vec<HashMap<String, Value>>,
  vectors: Vec<Vec<f32>>,
) -> Result<(), QdrantError> {
  let mut qdrant_log_file = get_qdrant_logfile();

  let mut batch_map = Map::new();
  let parsed_ids: Value = ids.into_iter().collect();
  batch_map.insert("ids".to_string(), parsed_ids);
  let parsed_payloads: Value = serde_json::to_value(payloads).unwrap();
  batch_map.insert("payloads".to_string(), parsed_payloads);
  let parsed_vectors: Value = vectors.into_iter().collect();
  batch_map.insert("vectors".to_string(), parsed_vectors);
  let mut json = Map::new();
  json.insert("batch".to_string(), Value::Object(batch_map));
  let client = Client::new();
  let result = client
    .put(format!(
      "{}/collections/{}/points",
      get_qdrant_base_url(),
      COLLECTION_NAME
    ))
    .json(&json)
    .send()
    .await;
  match result {
    Ok(response) => {
      let json: BaseQdrantResponse = response.json::<BaseQdrantResponse>().await.unwrap();
      if json.status.is_string() && json.status.as_str().unwrap() == String::from("ok") {
        return Ok(());
      }
      if json.status.is_string() {
        let _ = writeln!(
          qdrant_log_file,
          "Knapsack - error upserting points: {}",
          json.status.as_str().unwrap()
        );
      }
      return Err(QdrantError::ActionError(CustomQdrantError::new(
        "Creating points failed",
      )));
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

#[derive(Debug, Deserialize)]
pub struct SearchPointsResponseResultHits {
  pub id: String,
  pub score: f32,
  pub payload: Value,
}

#[derive(Debug, Deserialize)]
pub struct SearchPointsResponseResultItem {
  pub id: u64,
  pub hits: Vec<SearchPointsResponseResultHits>,
}

#[derive(Debug, Deserialize)]
pub struct SearchPointsResponseResult {
  pub groups: Vec<SearchPointsResponseResultItem>,
}

#[derive(Debug, Deserialize)]
pub struct SearchPointsResponse {
  pub result: SearchPointsResponseResult,
  status: String,
}

pub async fn search_points(
  vector: Vec<f32>,
  limit: usize,
  maybe_filter: Option<Value>,
  maybe_params: Option<Value>,
  maybe_with_vectors: Option<bool>,
  maybe_with_payload: Option<bool>,
) -> Result<SearchPointsResponse, QdrantError> {
  let mut qdrant_log_file = get_qdrant_logfile();

  let mut json = Map::new();
  json.insert("limit".to_string(), Value::Number(Number::from(limit)));

  json.insert(
    "group_by".to_string(),
    Value::String("document_id".to_string()),
  );
  json.insert("group_size".to_string(), Value::Number(Number::from(5)));

  let parsed_vector: Value = vector.into_iter().collect();
  json.insert("vector".to_string(), parsed_vector);

  if let Some(filter) = maybe_filter {
    json.insert("filter".to_string(), filter);
  }

  if let Some(params) = maybe_params {
    json.insert("params".to_string(), params);
  }

  if let Some(with_vectors) = maybe_with_vectors {
    json.insert("with_vectors".to_string(), Value::Bool(with_vectors));
  }

  if let Some(with_payload) = maybe_with_payload {
    json.insert("with_payload".to_string(), Value::Bool(with_payload));
  }

  let client = Client::new();
  let result = client
    .post(format!(
      "{}/collections/{}/points/search/groups",
      get_qdrant_base_url(),
      COLLECTION_NAME
    ))
    .json(&json)
    .send()
    .await;
  match result {
    Ok(response) => {
      let maybe_response = response.json::<SearchPointsResponse>().await;
      match maybe_response {
        Ok(response) => Ok(response),
        Err(error) => {
          let qdrant_err = error.to_string();
          let _ = writeln!(
            qdrant_log_file,
            "Knapsack - error searching points: {}",
            qdrant_err
          );
          return Err(QdrantError::ActionError(CustomQdrantError::new(
            &qdrant_err,
          )));
        }
      }
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GetPointsResponseResult {
  pub id: String,
  pub payload: HashMap<String, Value>,
  pub vector: Option<Vec<f32>>,
}

#[derive(Debug, Deserialize)]
pub struct GetPointResponse {
  pub result: Option<GetPointsResponseResult>,
}

pub async fn get_point(point_id: String) -> Result<GetPointResponse, QdrantError> {
  let client = Client::new();
  let result = client
    .get(format!(
      "{}/collections/{}/points/{}",
      get_qdrant_base_url(),
      COLLECTION_NAME,
      point_id
    ))
    .send()
    .await;
  match result {
    Ok(response) => {
      let maybe_response = response.json::<GetPointResponse>().await;
      if let Err(e) = maybe_response {
        return Err(QdrantError::ActionError(CustomQdrantError::new(
          &e.to_string(),
        )));
      }
      return Ok(maybe_response.unwrap());
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GetPointsResponse {
  pub result: Option<Vec<GetPointsResponseResult>>,
}

pub async fn get_points(point_ids: Vec<String>) -> Result<GetPointsResponse, QdrantError> {
  let body = json!({ "ids": point_ids, "with_payload": true, "with_vector": false });

  let client = Client::new();
  let result = client
    .post(format!(
      "{}/collections/{}/points",
      get_qdrant_base_url(),
      COLLECTION_NAME,
    ))
    .json(&body)
    .send()
    .await;
  match result {
    Ok(response) => {
      let maybe_response = response.json::<GetPointsResponse>().await;
      if let Err(e) = maybe_response {
        return Err(QdrantError::ActionError(CustomQdrantError::new(
          &e.to_string(),
        )));
      }
      return Ok(maybe_response.unwrap());
    }
    Err(error) => Err(handle_qdrant_request_error(error)),
  }
}
