import logging
from typing import AsyncGenerator, Dict, List
from backend.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "Error: OPENAI_API_KEY is not configured in backend/.env. Please set it or switch to LLM_PROVIDER=mock."
            return

        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)

            formatted_messages = [{"role": "system", "content": system_prompt}]
            for msg in messages:
                formatted_messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })

            response = await client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                stream=True,
            )

            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"OpenAI streaming error: {str(e)}", exc_info=True)
            yield f"\n\n[OpenAI Error: {str(e)}]"
