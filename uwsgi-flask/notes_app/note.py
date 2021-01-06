import json

class Note:

    def __init__(self, title, author, date, text):
        self.__title = title
        self.__author = author
        self.__date = date
        self.__text = text

    @classmethod
    def from_json(cls, data):
        return cls(**data)