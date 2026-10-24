from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, List

class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM providers.
    All providers must implement `stream_chat`.
    """

    @abstractmethod
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str
    ) -> AsyncGenerator[str, None]:
        """
        Yields chunks of text in real-time as they are generated.
        :param messages: List of dicts, each with 'role' ('user' | 'assistant') and 'content'.
        :param system_prompt: System personality and instructions.
        """
        yield ""
