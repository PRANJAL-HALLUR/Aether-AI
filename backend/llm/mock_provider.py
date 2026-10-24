import asyncio
import random
import re
from typing import AsyncGenerator, Dict, List
from backend.llm.base import BaseLLMProvider

class MockLLMProvider(BaseLLMProvider):
    """
    Mock LLM provider that streams simulated intelligent responses
    word by word with realistic latency, demonstrating markdown, code blocks,
    and contextual replies without requiring any API keys.
    """

    def __init__(self, token_delay: float = 0.035):
        self.token_delay = token_delay

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str
    ) -> AsyncGenerator[str, None]:
        last_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_message = m.get("content", "").strip()
                break

        response_text = self._generate_response(last_message)

        # Split response into tokens (words and punctuation) preserving spaces and newlines
        tokens = re.findall(r"\S+|\n+", response_text)

        for i, token in enumerate(tokens):
            if token.startswith("\n"):
                yield token
            else:
                yield token + " "
            
            # Subtle jitter for realistic typing cadence
            jitter = random.uniform(0.015, self.token_delay * 1.5)
            await asyncio.sleep(jitter)

    def _generate_response(self, user_msg: str) -> str:
        lower = user_msg.lower()

        if any(w in lower for w in ["code", "python", "fastapi", "next", "react", "script", "function"]):
            return (
                "Here is an elegant, modular implementation designed with clean architecture:\n\n"
                "```python\n"
                "# Aether AI - Real-time SSE Stream Consumer Example\n"
                "import httpx\n"
                "import asyncio\n\n"
                "async def stream_aether_chat(prompt: str):\n"
                "    url = 'http://localhost:8000/api/chat'\n"
                "    payload = {'message': prompt}\n"
                "    async with httpx.AsyncClient(timeout=30.0) as client:\n"
                "        async with client.stream('POST', url, json=payload) as response:\n"
                "            async for chunk in response.aiter_text():\n"
                "                if chunk.startswith('data: '):\n"
                "                    print(chunk[6:], end='', flush=True)\n\n"
                "# Example execution\n"
                "if __name__ == '__main__':\n"
                "    asyncio.run(stream_aether_chat('Hello Aether!'))\n"
                "```\n\n"
                "### Key Architecture Highlights:\n"
                "1. **Non-blocking Async I/O**: Stream tokens instantaneously without thread starvation.\n"
                "2. **Backpressure Handling**: Respects buffer limits for seamless client consumption.\n"
                "3. **Modular Expansion**: Ready to feed directly into audio synthesis or 3D avatar facial blendshapes.\n\n"
                "Let me know if you would like me to extend this with custom state management or WebSockets!"
            )
        
        if any(w in lower for w in ["avatar", "3d", "voice", "audio", "vision", "multimodal"]):
            return (
                "### Multimodal & Avatar Architecture Roadmap\n\n"
                "The reserved **Avatar Panel** on the right is engineered specifically to interface with:\n\n"
                "- **3D Canvas / WebGL / Three.js**: Real-time rendering of expressive 3D mesh with morph targets and Viseme blendshapes.\n"
                "- **Speech-to-Speech (S2S) & TTS**: Streaming audio synchronization aligned with token generation.\n"
                "- **Spatial Audio Visualizers**: Responsive animated wave dynamics synchronized with audio decibels.\n\n"
                "The state emitted by the `useChat` hook directly exposes token events and state transitions (`isStreaming`, `onChunk`), "
                "allowing the upcoming avatar engine to interpolate facial expressions seamlessly in lockstep with the generated thought stream."
            )

        if any(w in lower for w in ["who are you", "what can you do", "introduce", "brand", "aether"]):
            return (
                "Hello! I am **Aether AI**, your intelligent conversational copilot.\n\n"
                "I am built on a modern high-performance full-stack architecture:\n\n"
                "- **Backend**: FastAPI with asynchronous SSE token streaming and SQLAlchemy ORM.\n"
                "- **Frontend**: Next.js App Router, Tailwind CSS, shadcn-inspired glassmorphism, and Framer Motion micro-interactions.\n"
                "- **Flexibility**: Zero-dependency mock mode for offline testing, switchable to OpenAI or Anthropic Claude in one environment flag.\n"
                "- **Future-Proof**: Dedicated layout slot for our upcoming real-time talking avatar and voice agent.\n\n"
                "How can I assist you with your project, architecture, or ideas today?"
            )

        # Default rich conversational response
        return (
            f"Thank you for sharing your thoughts on **\"{user_msg}\"**!\n\n"
            "Here is how we can break this down effectively:\n\n"
            "### 1. Conceptual Framework\n"
            "When approaching this problem, maintaining separation of concerns between state presentation and stream processing ensures clean scalability.\n\n"
            "### 2. Strategic Advantages\n"
            "- **High Responsiveness**: Real-time server-sent events guarantee sub-100ms time-to-first-token.\n"
            "- **Resilience**: Comprehensive retry strategies, graceful connection recovery, and client-side abort controls.\n"
            "- **Polished UX**: Thoughtful micro-animations, accessible contrast ratios, and dark/light ambient aesthetics.\n\n"
            "Would you like to dive deeper into any specific implementation detail or explore another angle?"
        )
