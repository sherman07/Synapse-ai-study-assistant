import { closePool, createPool } from "./pool.js";

const tables = [
  "progress_records",
  "flashcards",
  "flashcard_decks",
  "focus_sessions",
  "study_room_members",
  "study_rooms",
  "generated_contents",
  "users"
];

async function resetLocalData() {
  const pool = createPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const table of tables) {
      await connection.query(`DELETE FROM ${table}`);
    }
    await connection.commit();
    console.log("Synapse local MySQL app data was cleared.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await closePool();
  }
}

resetLocalData().catch(error => {
  console.error("Could not clear Synapse local MySQL data:", error.message);
  process.exitCode = 1;
});
