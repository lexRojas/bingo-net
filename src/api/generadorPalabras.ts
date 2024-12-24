"use server";

import casual from "casual";

export default async function generaPartida(): Promise<string> {
  return casual.word.toUpperCase();
}
