# Nya-AI SLOs

What each service-level objective means, how it is computed, and its target. The targets are
proposals for the capstone, not measured results. The test sheet `evals/slo-test-sheet.xlsx` holds
the same definitions and targets (yellow cells on the "SLO definitions" sheet); keep the two in step.

## Definitions and targets

| SLO | Definition | How it is computed | Source | Target | Langfuse score |
|---|---|---|---|---|---|
| Faithfulness | Share of claims in the answer supported by the retrieved sections. Catches hallucination. | An LLM splits the answer into claims and checks each against the retrieved context. Supported claims ÷ all claims. | Ragas `Faithfulness` | ≥ 0.90 | `faithfulness` |
| Answer relevancy | How directly the answer addresses the question, whether or not it is correct. | An LLM writes 3 questions the answer would answer; mean cosine similarity between them and the real question. | Ragas `ResponseRelevancy` | ≥ 0.85 | `answer_relevancy` |
| Context precision | Whether the sections that matter are ranked at the top of retrieval. | Mean precision@k over the positions of relevant chunks, judged against the reference answer. | Ragas `LLMContextPrecisionWithReference` | ≥ 0.80 | `context_precision` |
| Context recall | Whether retrieval found everything needed to answer. | Reference answer split into claims; claims found in the retrieved context ÷ all reference claims. | Ragas `LLMContextRecall` | ≥ 0.85 | `context_recall` |
| Confidence | The agent's own estimate that its answer is right. Decides answer, caveat or hand-over. | 0.4 × retrieval score (mean of top-3 reranked similarities) + 0.4 × critic faithfulness + 0.2 × agreement (share of top-5 sections found by both BM25 and vector). | Nya-AI | 90% of High answers correct | `confidence` |
| Citation accuracy | Every cited act and section exists and its text supports the paragraph citing it. | Critic checks each citation against stored section text. Correct ÷ all citations. | Nya-AI critic | ≥ 95% | `citation_accuracy` |
| Escalation accuracy | Questions that must go to an advocate or emergency help do; safe ones are not escalated. | Correct escalation decisions ÷ all queries, against the golden set. | Nya-AI | 100% | `escalation_accuracy` |
| Input guardrail catch rate | Unsafe inputs (prompt injection, fraud requests, PII) caught before retrieval. | Flagged unsafe inputs ÷ all unsafe inputs in the adversarial cases. | Nya-AI guard node | ≥ 95% | `input_guard_catch` |
| Latency p95 | Time from question to complete answer for 95% of queries. | 95th percentile of end-to-end trace duration. | Langfuse | ≤ 8 s | `latency_p95_s` |
| Cost per answer | Model spend per answered question. | Token cost on the trace, in ₹. | Langfuse | ≤ ₹2 | `cost_inr` |

Confidence bands: **High** ≥ 0.75 answers; **Medium** 0.50–0.75 answers with a caveat or asks the
incident date; **Low** < 0.50 does not answer and offers an advocate.

## Guardrails

- **Input** (guard node, before retrieval): prompt-injection detection, PII masking (Aadhaar,
  phone, email) before the model or Langfuse sees it, refusal of unsafe intent (fake documents,
  false FIRs, evading arrest), emergency wording routed to 112 and 181.
- **Output** (before the user sees it): strict grounding in retrieved sections, critic citation
  check, confidence gate, no predictions or advice on a user's own case.

## How the SLOs are tested

1. **Static analysis:** Ruff (lint and format) and pylint on every push.
2. **SLO test cases:** pytest cases built to produce a known score and explain it. Probes P01–P10
   in the test sheet: high faithfulness (theft, BNS §303), low faithfulness with retrieval off
   (negative control), high relevance (Zero FIR), low relevance on a vague question (negative
   control), medium confidence (cheating, no date), low confidence (an act not in the library),
   input guardrail hits (injection, PII), output guardrail hits (bad citation, advice).
3. **Ragas into Langfuse:** Ragas scores the golden dataset; each score is attached to its Langfuse
   trace and dataset run, not only logged.
4. **Test sheet:** `evals/slo-test-sheet.xlsx` has the 50 golden queries
   (legal-docs-platform `evals/GOLDEN-QUERIES.md`) plus the 10 probes. Enter scores in the yellow
   cells; Pass, confidence band, category averages and charts update. Fix the weakest area, run
   again.

Not built yet: Ruff/pylint config, the Ragas runner, the SLO pytest cases and the Langfuse score
push. They belong with R1 (agent graph) and R4 (evals).
