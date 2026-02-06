/// Token cost calculation per provider and model.
///
/// Prices are in USD per 1K tokens (input / output).
/// Last updated: Feb 2026.  Adjust as pricing changes.

#[derive(Debug, Clone)]
pub struct ModelPricing {
    pub input_per_1k: f64,
    pub output_per_1k: f64,
}

/// Look up pricing for a given provider + model name.
/// Falls back to a conservative estimate if the exact model is unknown.
pub fn get_pricing(provider: &str, model: &str) -> ModelPricing {
    let model_lower = model.to_lowercase();
    match provider {
        "openai" => openai_pricing(&model_lower),
        "anthropic" => anthropic_pricing(&model_lower),
        "gemini" => gemini_pricing(&model_lower),
        "groq" => groq_pricing(&model_lower),
        "local" => ModelPricing { input_per_1k: 0.0, output_per_1k: 0.0 },
        _ => ModelPricing { input_per_1k: 0.003, output_per_1k: 0.006 }, // conservative fallback
    }
}

fn openai_pricing(model: &str) -> ModelPricing {
    if model.contains("gpt-4o-mini") {
        ModelPricing { input_per_1k: 0.00015, output_per_1k: 0.0006 }
    } else if model.contains("gpt-4o") {
        ModelPricing { input_per_1k: 0.0025, output_per_1k: 0.01 }
    } else if model.contains("gpt-4-turbo") {
        ModelPricing { input_per_1k: 0.01, output_per_1k: 0.03 }
    } else if model.contains("gpt-4") {
        ModelPricing { input_per_1k: 0.03, output_per_1k: 0.06 }
    } else if model.contains("gpt-3.5") {
        ModelPricing { input_per_1k: 0.0005, output_per_1k: 0.0015 }
    } else if model.contains("o1-mini") {
        ModelPricing { input_per_1k: 0.003, output_per_1k: 0.012 }
    } else if model.contains("o1") {
        ModelPricing { input_per_1k: 0.015, output_per_1k: 0.06 }
    } else {
        // Default to gpt-4o pricing as a safe estimate
        ModelPricing { input_per_1k: 0.0025, output_per_1k: 0.01 }
    }
}

fn anthropic_pricing(model: &str) -> ModelPricing {
    if model.contains("opus") {
        ModelPricing { input_per_1k: 0.015, output_per_1k: 0.075 }
    } else if model.contains("haiku") {
        ModelPricing { input_per_1k: 0.00025, output_per_1k: 0.00125 }
    } else if model.contains("sonnet") {
        ModelPricing { input_per_1k: 0.003, output_per_1k: 0.015 }
    } else {
        // Default to Sonnet pricing
        ModelPricing { input_per_1k: 0.003, output_per_1k: 0.015 }
    }
}

fn gemini_pricing(model: &str) -> ModelPricing {
    if model.contains("flash") {
        ModelPricing { input_per_1k: 0.000075, output_per_1k: 0.0003 }
    } else if model.contains("pro") {
        ModelPricing { input_per_1k: 0.00125, output_per_1k: 0.005 }
    } else {
        ModelPricing { input_per_1k: 0.000075, output_per_1k: 0.0003 }
    }
}

fn groq_pricing(model: &str) -> ModelPricing {
    if model.contains("llama") {
        ModelPricing { input_per_1k: 0.0002, output_per_1k: 0.0002 }
    } else if model.contains("mixtral") {
        ModelPricing { input_per_1k: 0.00024, output_per_1k: 0.00024 }
    } else {
        ModelPricing { input_per_1k: 0.0002, output_per_1k: 0.0002 }
    }
}

/// Calculate cost in USD given token counts and pricing.
pub fn calculate_cost(input_tokens: i64, output_tokens: i64, pricing: &ModelPricing) -> f64 {
    let input_cost = (input_tokens as f64 / 1000.0) * pricing.input_per_1k;
    let output_cost = (output_tokens as f64 / 1000.0) * pricing.output_per_1k;
    input_cost + output_cost
}

/// Estimate input tokens from a message string.
/// Rough approximation: ~4 characters per token for English text.
pub fn estimate_tokens(text: &str) -> i64 {
    (text.len() as f64 / 4.0).ceil() as i64
}

/// Classify a task to determine which model tier should be used.
/// Returns "haiku" for simple tasks, "sonnet" for complex ones.
pub fn classify_task_complexity(prompt: &str) -> &'static str {
    let lower = prompt.to_lowercase();

    // Complex tasks that warrant Sonnet
    let complex_indicators = [
        "architect", "security", "review", "analyze", "debug",
        "refactor", "design", "strategy", "compliance", "audit",
        "complex", "production", "critical",
    ];

    for indicator in &complex_indicators {
        if lower.contains(indicator) {
            return "sonnet";
        }
    }

    // Default to cheaper model
    "haiku"
}
