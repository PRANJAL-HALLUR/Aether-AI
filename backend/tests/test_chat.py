import json
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from backend.main import app
from backend.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        assert data["provider"] == "mock"
        assert "version" in data

@pytest.mark.asyncio
async def test_conversations_empty_or_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/conversations")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_chat_streaming_and_persistence():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Send chat request
        payload = {"message": "Hello Aether, tell me about your architecture"}
        events = []
        conversation_id = None

        async with client.stream("POST", "/api/chat", json=payload) as response:
            assert response.status_code == 200
            assert "text/event-stream" in response.headers.get("content-type", "")

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    event_data = json.loads(line[6:])
                    events.append(event_data)
                    if event_data.get("type") == "start":
                        conversation_id = event_data.get("conversation_id")

        assert len(events) > 2
        assert events[0]["type"] == "start"
        assert any(e["type"] == "chunk" for e in events)
        assert events[-1]["type"] == "end"
        assert conversation_id is not None

        # 2. Check conversation was saved in SQLite
        convo_resp = await client.get(f"/api/conversations/{conversation_id}")
        assert convo_resp.status_code == 200
        convo_data = convo_resp.json()
        assert convo_data["id"] == conversation_id
        assert len(convo_data["messages"]) == 2  # user + assistant
        assert convo_data["messages"][0]["role"] == "user"
        assert convo_data["messages"][0]["content"] == "Hello Aether, tell me about your architecture"
        assert convo_data["messages"][1]["role"] == "assistant"
        assert len(convo_data["messages"][1]["content"]) > 0

        # 3. Clean up by deleting conversation
        del_resp = await client.delete(f"/api/conversations/{conversation_id}")
        assert del_resp.status_code == 200
