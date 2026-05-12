import { Client, GatewayIntentBits } from 'discord.js';
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.TARGET_GUILD_ID;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', async () => {
  const guild = await client.guilds.fetch(GUILD_ID);
  const roles = await guild.roles.fetch();
  console.log('=== ROLES ===');
  for (const [, r] of roles) {
    console.log(`  "${r.name}" | color: ${r.hexColor} | perms: ${r.permissions.bitfield} | pos: ${r.position} | managed: ${r.managed}`);
  }
  const channels = await guild.channels.fetch();
  console.log('\n=== CHANNELS ===');
  for (const [, ch] of channels) {
    if (ch) console.log(`  #${ch.name} | type: ${ch.type} | parent: ${ch.parent?.name || 'none'}`);
  }
  process.exit(0);
});
client.login(TOKEN);
