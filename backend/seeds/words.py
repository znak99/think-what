"""
초성 시드 데이터
실행: python seeds/words.py (backend/ 디렉토리에서)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models.word import Word

CONSONANTS = [
    "ㅈㅈ", "ㅂㅈ", "ㅅㅅ", "ㅇㅁ", "ㅁㅎ",
    "ㅅㄱ", "ㅈㄱ", "ㅈㅅ", "ㅅㅈ", "ㄷㅂ",
    "ㅈㄹ", "ㅎㅁ", "ㅁㄹ", "ㅊㅇ", "ㅁㅇ",
    "ㅂㅇ", "ㄱㄱ", "ㅂㅂ", "ㅊㅊ", "ㄴㄴ",
    "ㅇㅈ", "ㄹㄱ",
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Word).count()
        if existing > 0:
            db.query(Word).delete()
            db.commit()
            print(f"기존 {existing}개 데이터를 삭제했습니다.")

        words = [Word(word=c, consonants=c) for c in CONSONANTS]
        db.add_all(words)
        db.commit()
        print(f"{len(words)}개의 초성을 추가했습니다.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
