import logging
from backend.config import Settings
from backend.llm.base import BaseLLMProvider
from backend.llm.mock_provider import MockLLMProvider
from backend.llm.openai_provider import OpenAILLMProvider
from backend.llm.anthropic_provider import AnthropicLLMProvider

logger = logging.getLogger(__name__)

def get_llm_provider(settings: Settings) -> BaseLLMProvider:
    provider_name = (settings.LLM_PROVIDER or "mock").strip().lower()

    if provider_name == "openai":
        logger.info(f"Using OpenAI LLM provider with model: {settings.OPENAI_MODEL}")
        return OpenAILLMProvider(
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL
        )
    elif provider_name == "anthropic":
        logger.info(f"Using Anthropic LLM provider with model: {settings.ANTHROPIC_MODEL}")
        return AnthropicLLMProvider(
            api_key=settings.ANTHROPIC_API_KEY,
            model=settings.ANTHROPIC_MODEL
        )
    else:
        logger.info("Using default Mock LLM provider (offline mode)")
        return MockLLMProvider()
