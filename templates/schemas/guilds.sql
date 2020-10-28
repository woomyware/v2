CREATE TABLE guilds(
    guild_id bigint,
    prefix text DEFAULT '~',
    mutedRole bigint DEFAULT NULL,
    autorole bigint DEFAULT NULL,
    welcomeChannel bigint DEFAULT NULL,
    welcomeMessage varchar(2000) DEFAULT 'Hey there {{user}}, and welcome to {{server}}!',
    leaveChannel bigint DEFAULT NULL,
    leaveMessage varchar(2000) DEFAULT 'See you around, {{user}}.',
    chatlogsChannel bigint DEFAULT NULL,
    modlogsChannel bigint DEFAULT NULL,
    starboardChannel bigint DEFAULT NULL,
    blocklist bigint[] DEFAULT '{}',
    disabledCommands text[] DEFAULT '{}',
    disabledCategories text[] DEFAULT '{}',
    PRIMARY KEY (guild_id)
);