const { Event } = require("../classes.js");

module.exports = class GuildMemberRemove extends Event {
  constructor(client) {
    super(client, { name: "guildMemberRemove", emitter: client });
  }
  async run(member) {
    let perm = await this.client.models.perms.findOne({});
    if (perm) {
      if (perm.owners.includes(member.user.id)) {
        const index = perm.owners.findIndex(e => e == member.user.id);
        perm.owners.splice(index, 1);
      }
      if (perm.admins.includes(member.user.id)) {
        const index = perm.admins.findIndex(e => e == member.user.id);
        perm.admins.splice(index, 1);
      }
      if (perm.mods.includes(member.user.id)) {
        const index = perm.mods.findIndex(e => e == member.user.id);
        perm.mods.splice(index, 1);
      }
      if (perm.users.includes(member.user.id)) {
        const index = perm.users.findIndex(e => e == member.user.id);
        perm.users.splice(index, 1);
      }
      perm.updated = true;
      await perm.save();
    }
  }
};
