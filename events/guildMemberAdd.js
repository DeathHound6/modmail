const { Event } = require("../classes.js");

module.exports = class GuildMemberAdd extends Event {
  constructor(client) {
    super(client, { name: "guildMemberAdd", emitter: client });
  }
  async run(member) {
    let perm = await this.client.models.perms.findOne({});
    if (!perm) {
      const doc = {
        owners: [],
        mods: [],
        users: [member.user.id]
      };
      await new this.client.models.perms(doc).save();
    } else {
      perm.users.push(member.user.id);
      perm.updated = true;
      await perm.save();
    }
  }
};
