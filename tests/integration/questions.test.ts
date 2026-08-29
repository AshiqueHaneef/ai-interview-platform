import { beforeAll, describe, expect, it } from "vitest";
import { authenticateCandidate, GATEWAY_URL } from "./support/candidate";

interface Question {
  slug: string;
  interviewType: "system_design" | "behavioral";
  prompt: string;
  topicTags: string[];
  difficulty: "junior" | "mid" | "senior";
}

let credential: string;

beforeAll(async () => {
  credential = await authenticateCandidate();
});

async function browse(query = ""): Promise<Question[]> {
  const response = await fetch(`${GATEWAY_URL}/questions${query}`, {
    headers: { cookie: credential },
  });
  expect(response.status).toBe(200);
  return (await response.json()) as Question[];
}

describe("browsing the Question Bank", () => {
  it("is refused to a caller who isn't authenticated", async () => {
    const response = await fetch(`${GATEWAY_URL}/questions`);

    expect(response.status).toBe(401);
  });

  it("lists seeded Questions with their topic tags and difficulty", async () => {
    const questions = await browse();

    expect(questions.length).toBeGreaterThanOrEqual(20);
    expect(questions).toContainEqual({
      slug: "design-a-url-shortener",
      interviewType: "system_design",
      prompt: expect.stringContaining("URL shortener"),
      topicTags: expect.arrayContaining(["caching"]),
      difficulty: "junior",
    });
  });

  it("covers both Interview Types", async () => {
    const questions = await browse();

    const types = new Set(questions.map((question) => question.interviewType));
    expect([...types].sort()).toEqual(["behavioral", "system_design"]);
  });

  it("never leaks the Rubric Hint, which would give the answer away", async () => {
    const questions = await browse();

    expect(questions.every((question) => !("rubricHint" in question))).toBe(
      true,
    );
  });

  it("holds each Question once, however often the seed is re-run", async () => {
    const slugs = (await browse()).map((question) => question.slug);

    expect(slugs).toEqual([...new Set(slugs)]);
  });
});

describe("filtering the Question Bank", () => {
  it("narrows to one Interview Type", async () => {
    const questions = await browse("?interviewType=behavioral");

    expect(questions.length).toBeGreaterThan(0);
    expect(
      questions.every((question) => question.interviewType === "behavioral"),
    ).toBe(true);
    expect(questions.length).toBeLessThan((await browse()).length);
  });

  it("narrows to one topic", async () => {
    const questions = await browse("?topic=caching");

    expect(questions.length).toBeGreaterThan(0);
    expect(
      questions.every((question) => question.topicTags.includes("caching")),
    ).toBe(true);
  });

  it("combines Interview Type and topic", async () => {
    const questions = await browse("?interviewType=system_design&topic=caching");

    expect(questions.length).toBeGreaterThan(0);
    expect(
      questions.every(
        (question) =>
          question.interviewType === "system_design" &&
          question.topicTags.includes("caching"),
      ),
    ).toBe(true);
  });

  it("returns nothing for a topic no Question carries", async () => {
    expect(await browse("?topic=underwater-basket-weaving")).toEqual([]);
  });

  it("rejects an Interview Type that isn't one of the two", async () => {
    const response = await fetch(`${GATEWAY_URL}/questions?interviewType=dsa`, {
      headers: { cookie: credential },
    });

    expect(response.status).toBe(400);
  });
});
