"""Nya-AI agent service. R0 holds the law library; the LangGraph graph arrives in R1."""


def main() -> None:
    from nya_agent.library.cli import main as cli_main

    cli_main()
