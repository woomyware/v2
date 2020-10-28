CREATE TABLE users(
    user_id bigint DEFAULT NULL,
    prefix text DEFAULT '~',
    experience bigint DEFAULT 0,
    seashells bigint DEFAULT 0,
    relationships bigint[] DEFAULT '{}',
    pronouns text DEFAULT NULL,
    colour text DEFAULT NULL,
    PRIMARY KEY (user_id)
);