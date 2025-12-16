# ingest_kb.py
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def create_vector_store():
    vs = client.vector_stores.create(name="MyApp-KB")
    print("Created vector store:", vs.id)
    return vs.id

def upload_files(vector_store_id: str):
    import glob

    files = glob.glob("kb/*")
    print("Uploading files:", files)

    for path in files:
        with open(path, "rb") as f:
            client.vector_stores.files.upload_and_poll(
                vector_store_id=vector_store_id,
                file=f,
            )
            print("Uploaded:", path)

if __name__ == "__main__":
    vs_id = create_vector_store()
    upload_files(vs_id)
    print("\nUse this VECTOR_STORE_ID in your .env:")
    print("VECTOR_STORE_ID=", vs_id)
