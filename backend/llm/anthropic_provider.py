import logging
from typing import AsyncGenerator, Dict, List
from backend.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class AnthropicLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.model = model

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "Error: ANTHROPIC_API_KEY is not configured in backend/.env. Please set it or switch to LLM_PROVIDER=mock."
            return

        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=self.api_key)

            formatted_messages = []
            for msg in messages:
                role = msg.get("role", "user")
                if role in ["user", "assistant"]:
                    formatted_messages.append({
                        "role": role,
                        "content": msg.get("content", "")
                    })

            async with client.messages.stream(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=formatted_messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield text

        except Exception as e:
            logger.error(f"Anthropic streaming error: {str(e)}", exc_info=True)
            yield f"\n\n[Anthropic Error: {str(e)}]"
