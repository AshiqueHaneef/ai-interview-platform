# AI Interview Platform

A real-time AI mock-interview practice tool: an LLM interviewer conducts system-design and behavioral interviews (text first, voice later), scores each session against a fixed rubric, and tracks weak areas across sessions.

## Language

### Interviewing

**Session**:
One complete mock interview from first question to final feedback. The unit of history, scoring, and replay.
_Avoid_: Interview (ambiguous with the type), conversation, chat

**Interview Type**:
The kind of interview a Session conducts — `system_design` or `behavioral` in v1. Determines which Rubric applies.
_Avoid_: Category, mode

**Interviewer**:
The LLM persona conducting the Session — asks the Question, probes with Follow-ups, never gives answers away mid-Session.
_Avoid_: Bot, assistant, agent

**Question**:
A single curated prompt in the Question Bank, tagged with Interview Type, topics, difficulty, and a Rubric Hint.
_Avoid_: Prompt (reserved for LLM prompts), task

**Question Bank**:
The curated, owned set of Questions (~60–100 seed). Not scraped, not LLM-generated in v1.
_Avoid_: Dataset, corpus

**Follow-up**:
A probing question the Interviewer generates in reaction to the candidate's answer, within the same Question.
_Avoid_: Sub-question

**Turn**:
One exchange in a Session: a candidate utterance (text or transcribed voice) and the Interviewer's response.
_Avoid_: Message pair, round

**Transcript**:
The ordered record of all Turns in a Session. The raw material for scoring and replay.
_Avoid_: Log, history

**Candidate**:
The person being interviewed — the authenticated account behind every Session. One email/password login.
_Avoid_: User (reserved for the database row), account holder

**Credential**:
The signed, httpOnly cookie that authenticates a Candidate across requests. Never called a session — a Session is one mock interview.
_Avoid_: Session, token, login

### Scoring

**Rubric**:
The fixed set of Dimensions for an Interview Type. System design has five (requirements clarification, high-level architecture, deep-dive depth, trade-off reasoning, scaling/operations); behavioral has four (STAR structure, specificity, impact, reflection).
_Avoid_: Criteria, checklist

**Dimension**:
One named axis of a Rubric, scored 1–5 per Session with a required Evidence Quote.
_Avoid_: Metric, criterion, category

**Evidence Quote**:
A verbatim excerpt from the Transcript that justifies a Dimension's score. Required — a score without evidence is invalid.
_Avoid_: Citation, reference

**Rubric Hint**:
Question-specific guidance stored with a Question that steers the Interviewer's scoring of that Question (e.g. what a strong answer covers).
_Avoid_: Answer key, solution

**Weak Area**:
A Dimension or topic where the candidate's scores trend low across Sessions. Drives question selection; later drives embedding-based re-surfacing.
_Avoid_: Gap, deficiency
