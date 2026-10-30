"""LangGraph agents (release R1).

The graph will live here, one module per node: guard (input guardrails), temporal (which code was in
force), router, statute researcher, SQL agent, writer, critic (output guardrails) and advocate
review. It replaces `app.services.chat_engine.get_answer`. Retrieval comes from `app.rag`.
"""
