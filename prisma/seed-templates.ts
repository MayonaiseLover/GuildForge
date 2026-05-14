import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CATEGORIES = {
  gaming: [
    { name: "Competitive FPS Hub", desc: "Ranked matchmaking, team recruitment, and tournament brackets for competitive shooters.", tags: ["fps","ranked","tournaments"] },
    { name: "MMORPG Guild Hall", desc: "Raid scheduling, loot tracking, class discussions, and guild bank management.", tags: ["mmorpg","raids","guild"] },
    { name: "Minecraft SMP", desc: "Survival multiplayer with build showcases, trading posts, and world download archives.", tags: ["minecraft","survival","builds"] },
    { name: "Battle Royale Squad", desc: "Squad finder, loadout sharing, stats tracking, and clip highlights.", tags: ["battle-royale","squads","clips"] },
    { name: "Retro Gaming Lounge", desc: "Emulation help, ROM hacks, speedrun leaderboards, and nostalgia discussion.", tags: ["retro","emulation","speedrun"] },
    { name: "Esports Organization", desc: "Multi-game roster management, scrim scheduling, VOD review, and sponsor coordination.", tags: ["esports","scrims","professional"] },
    { name: "Fighting Game Dojo", desc: "Combo guides, matchup charts, tournament brackets, and training partner finder.", tags: ["fighting","combos","fgc"] },
    { name: "Mobile Gaming Hub", desc: "Gacha pulls, tier lists, co-op finder, and game recommendation threads.", tags: ["mobile","gacha","tier-lists"] },
    { name: "Racing League", desc: "Race calendar, livery sharing, tuning guides, and league standings.", tags: ["racing","sim","leagues"] },
    { name: "Tabletop RPG Tavern", desc: "Campaign scheduling, character sheets, world-building, and dice bot integration.", tags: ["ttrpg","dnd","campaigns"] },
    { name: "Strategy War Room", desc: "RTS and 4X game discussion, build orders, replays, and ranked ladders.", tags: ["strategy","rts","4x"] },
    { name: "Survival Crafting Base", desc: "Base building tips, resource guides, server listings, and co-op recruitment.", tags: ["survival","crafting","base-building"] },
    { name: "VR Gaming Lounge", desc: "VR game reviews, hardware help, multiplayer meetups, and comfort settings.", tags: ["vr","virtual-reality","multiplayer"] },
    { name: "Indie Game Community", desc: "Indie discovery, dev AMAs, beta testing, and review threads.", tags: ["indie","discovery","beta"] },
    { name: "Sports Sim League", desc: "Fantasy drafts, season scheduling, trade negotiations, and championship brackets.", tags: ["sports","fantasy","drafts"] },
  ],
  dev: [
    { name: "Full-Stack Forge", desc: "Code reviews, architecture debates, deployment pipelines, and project showcases.", tags: ["fullstack","code-review","devops"] },
    { name: "Open Source Collective", desc: "Contribution guides, issue triage, PR reviews, and maintainer coordination.", tags: ["oss","github","contributions"] },
    { name: "DevOps Pipeline", desc: "CI/CD workflows, infrastructure as code, monitoring dashboards, and incident response.", tags: ["devops","cicd","kubernetes"] },
    { name: "AI/ML Research Lab", desc: "Paper discussions, model training logs, dataset sharing, and GPU resource pooling.", tags: ["ai","ml","research"] },
    { name: "Frontend Craftsmen", desc: "UI/UX critiques, component libraries, performance audits, and design system building.", tags: ["frontend","react","css"] },
    { name: "Backend Architecture", desc: "API design, database optimization, microservices patterns, and system design.", tags: ["backend","api","databases"] },
    { name: "Cybersecurity Ops", desc: "CTF challenges, vulnerability research, tool sharing, and threat intel.", tags: ["security","ctf","pentesting"] },
    { name: "Mobile Dev Studio", desc: "iOS/Android development, cross-platform frameworks, app store optimization.", tags: ["mobile","ios","android"] },
    { name: "Data Engineering Hub", desc: "ETL pipelines, data warehousing, streaming architectures, and SQL optimization.", tags: ["data","sql","pipelines"] },
    { name: "Cloud Architects Guild", desc: "Multi-cloud strategies, cost optimization, serverless patterns, and certifications.", tags: ["cloud","aws","serverless"] },
    { name: "Rust Systems Lab", desc: "Systems programming, async patterns, embedded development, and WASM projects.", tags: ["rust","systems","wasm"] },
    { name: "Python Pythonistas", desc: "Django/FastAPI, data science, automation scripts, and package development.", tags: ["python","django","automation"] },
    { name: "Game Dev Workshop", desc: "Engine tutorials, asset pipelines, shader programming, and playtesting.", tags: ["gamedev","unity","unreal"] },
    { name: "Blockchain Builders", desc: "Smart contract development, DeFi protocols, audit reviews, and testnet deployments.", tags: ["blockchain","solidity","web3"] },
    { name: "Tech Interview Prep", desc: "Leetcode discussions, system design practice, mock interviews, and resume reviews.", tags: ["interviews","leetcode","career"] },
  ],
  community: [
    { name: "Content Creator Hub", desc: "Collabs, analytics sharing, thumbnail critiques, and growth strategies.", tags: ["youtube","twitch","content"] },
    { name: "Artist Collective", desc: "Portfolio reviews, commission boards, art challenges, and technique workshops.", tags: ["art","commissions","digital-art"] },
    { name: "Music Production Studio", desc: "Beat sharing, mixing feedback, sample packs, and collaboration finder.", tags: ["music","production","beats"] },
    { name: "Photography Guild", desc: "Photo critiques, gear reviews, editing tutorials, and location scouting.", tags: ["photography","editing","cameras"] },
    { name: "Book Club & Library", desc: "Reading challenges, genre discussions, author AMAs, and review threads.", tags: ["books","reading","literature"] },
    { name: "Fitness & Wellness", desc: "Workout programs, nutrition tracking, progress photos, and accountability partners.", tags: ["fitness","nutrition","health"] },
    { name: "Cooking & Recipes", desc: "Recipe sharing, cooking challenges, ingredient substitutions, and meal prep guides.", tags: ["cooking","recipes","food"] },
    { name: "Language Exchange", desc: "Practice partners, grammar help, resource sharing, and cultural exchange.", tags: ["languages","learning","exchange"] },
    { name: "Pet Owners Paradise", desc: "Pet photos, breed advice, health tips, and adoption coordination.", tags: ["pets","dogs","cats"] },
    { name: "Anime & Manga Society", desc: "Watch-alongs, manga discussions, fan art, and seasonal anime rankings.", tags: ["anime","manga","otaku"] },
    { name: "Film Critics Circle", desc: "Movie reviews, watch parties, director retrospectives, and screenplay analysis.", tags: ["movies","film","reviews"] },
    { name: "Travel Adventurers", desc: "Trip reports, budget tips, itinerary sharing, and travel buddy finder.", tags: ["travel","adventure","backpacking"] },
    { name: "DIY & Makers Space", desc: "Project builds, 3D printing, electronics, and woodworking tutorials.", tags: ["diy","3dprinting","makers"] },
    { name: "Mental Health Safe Space", desc: "Peer support, resource sharing, mindfulness exercises, and wellness check-ins.", tags: ["mental-health","support","wellness"] },
    { name: "Local City Hub", desc: "Events calendar, meetup coordination, local recommendations, and community news.", tags: ["local","meetups","events"] },
  ],
  study: [
    { name: "Computer Science Academy", desc: "Data structures, algorithms, OS concepts, and collaborative problem solving.", tags: ["cs","algorithms","programming"] },
    { name: "Medical School Study Group", desc: "Anatomy flashcards, case studies, board exam prep, and clinical rotations.", tags: ["medical","anatomy","boards"] },
    { name: "Law School Forum", desc: "Case briefs, moot court prep, bar exam study, and legal research methods.", tags: ["law","legal","bar-exam"] },
    { name: "Mathematics Circle", desc: "Proof workshops, problem sets, competition math, and research discussions.", tags: ["math","proofs","competitions"] },
    { name: "Physics Lab", desc: "Problem solving sessions, lab reports, research papers, and concept visualizations.", tags: ["physics","quantum","mechanics"] },
    { name: "Engineering Workshop", desc: "Design projects, CAD sharing, lab reports, and industry networking.", tags: ["engineering","cad","design"] },
    { name: "Business School Hub", desc: "Case competitions, financial modeling, startup pitches, and networking events.", tags: ["business","finance","mba"] },
    { name: "Chemistry Lab Partners", desc: "Reaction mechanisms, lab safety, organic chem help, and research collaboration.", tags: ["chemistry","organic","lab"] },
    { name: "History Research Society", desc: "Primary source analysis, essay peer review, timeline projects, and debate forums.", tags: ["history","research","essays"] },
    { name: "Language Arts Workshop", desc: "Creative writing, literary analysis, poetry critique, and publication guidance.", tags: ["writing","literature","poetry"] },
    { name: "Biology Study Circle", desc: "Cell biology, genetics, ecology discussions, and lab protocol sharing.", tags: ["biology","genetics","ecology"] },
    { name: "Economics Think Tank", desc: "Market analysis, policy debates, econometrics help, and research papers.", tags: ["economics","policy","markets"] },
    { name: "SAT/ACT Prep Academy", desc: "Practice tests, strategy guides, score tracking, and tutor matching.", tags: ["sat","act","test-prep"] },
    { name: "Graduate Research Lab", desc: "Thesis writing support, methodology discussions, citation management, and defense prep.", tags: ["graduate","thesis","research"] },
    { name: "Study Accountability Pod", desc: "Pomodoro sessions, goal tracking, study streaks, and weekly check-ins.", tags: ["accountability","pomodoro","habits"] },
  ],
  nft: [
    { name: "NFT Launch Pad", desc: "Mint alerts, whitelist management, art reveals, and holder verification.", tags: ["nft","mint","whitelist"] },
    { name: "DeFi Trading Floor", desc: "Yield farming strategies, liquidity pools, protocol analysis, and risk management.", tags: ["defi","yield","trading"] },
    { name: "DAO Governance Hub", desc: "Proposal discussions, voting coordination, treasury management, and contributor onboarding.", tags: ["dao","governance","voting"] },
    { name: "Crypto Alpha Group", desc: "On-chain analysis, token research, whale tracking, and market signals.", tags: ["crypto","alpha","analysis"] },
    { name: "Web3 Builder Space", desc: "dApp development, smart contract audits, hackathon teams, and grant applications.", tags: ["web3","dapp","hackathon"] },
    { name: "Metaverse District", desc: "Virtual land management, event planning, avatar customization, and world building.", tags: ["metaverse","virtual-land","events"] },
    { name: "Crypto Art Gallery", desc: "Digital art showcases, collector discussions, artist spotlights, and auction coordination.", tags: ["crypto-art","collectors","auctions"] },
    { name: "Token Launch Community", desc: "Tokenomics review, launch coordination, community building, and exchange listings.", tags: ["token","launch","tokenomics"] },
    { name: "GameFi Guild", desc: "Play-to-earn strategies, scholarship programs, game reviews, and earning optimization.", tags: ["gamefi","p2e","scholarships"] },
    { name: "Solana Ecosystem", desc: "Solana dApps, validator discussions, ecosystem updates, and developer resources.", tags: ["solana","validators","ecosystem"] },
    { name: "Ethereum Builders", desc: "ERC standards, Layer 2 solutions, MEV research, and protocol upgrades.", tags: ["ethereum","layer2","erc"] },
    { name: "NFT Photography", desc: "Photo NFT minting, collection curation, photographer spotlights, and marketplace tips.", tags: ["photo-nft","curation","marketplace"] },
    { name: "DePIN Network", desc: "Decentralized infrastructure, node operation, earnings tracking, and hardware guides.", tags: ["depin","nodes","infrastructure"] },
    { name: "Ordinals & BRC-20", desc: "Bitcoin inscriptions, BRC-20 tokens, marketplace analysis, and minting tools.", tags: ["ordinals","bitcoin","brc20"] },
    { name: "RWA Tokenization", desc: "Real-world asset tokenization, compliance, legal frameworks, and investment analysis.", tags: ["rwa","tokenization","compliance"] },
  ],
  agency: [
    { name: "Digital Marketing Agency", desc: "Client dashboards, campaign tracking, content calendars, and team standup channels.", tags: ["marketing","campaigns","analytics"] },
    { name: "Design Studio", desc: "Project boards, design critiques, asset libraries, and client feedback channels.", tags: ["design","ui-ux","branding"] },
    { name: "Software Consultancy", desc: "Sprint planning, code reviews, client communication, and knowledge base.", tags: ["consulting","sprints","clients"] },
    { name: "Video Production House", desc: "Project timelines, footage review, editing collaboration, and client deliverables.", tags: ["video","production","editing"] },
    { name: "PR & Communications Firm", desc: "Media lists, press releases, crisis management, and client reporting.", tags: ["pr","media","communications"] },
    { name: "SEO Agency Hub", desc: "Keyword research, ranking trackers, content briefs, and client reporting dashboards.", tags: ["seo","keywords","rankings"] },
    { name: "Social Media Agency", desc: "Content pipelines, engagement tracking, influencer outreach, and client approvals.", tags: ["social-media","content","influencer"] },
    { name: "Web Development Agency", desc: "Project scoping, sprint boards, staging reviews, and launch checklists.", tags: ["webdev","projects","launches"] },
    { name: "E-commerce Operations", desc: "Inventory management, order tracking, vendor communication, and analytics.", tags: ["ecommerce","inventory","vendors"] },
    { name: "Recruitment Agency", desc: "Candidate pipelines, interview scheduling, client requirements, and placement tracking.", tags: ["recruitment","hiring","talent"] },
    { name: "Architecture Firm", desc: "Blueprint reviews, client presentations, material sourcing, and project timelines.", tags: ["architecture","blueprints","construction"] },
    { name: "Event Planning Agency", desc: "Vendor coordination, timeline management, budget tracking, and client updates.", tags: ["events","planning","vendors"] },
    { name: "Legal Practice", desc: "Case management, document review, client communication, and deadline tracking.", tags: ["legal","cases","documents"] },
    { name: "Real Estate Team", desc: "Listing management, showing schedules, market analysis, and client CRM.", tags: ["real-estate","listings","crm"] },
    { name: "Freelancer Collective", desc: "Project boards, rate discussions, contract templates, and referral network.", tags: ["freelance","contracts","networking"] },
  ],
  other: [
    { name: "Startup Incubator", desc: "Pitch practice, investor updates, co-founder matching, and milestone tracking.", tags: ["startup","incubator","pitches"] },
    { name: "Podcast Network", desc: "Episode planning, guest coordination, cross-promotion, and listener engagement.", tags: ["podcast","episodes","guests"] },
    { name: "Newsletter Writers", desc: "Issue drafting, subscriber analytics, monetization strategies, and peer feedback.", tags: ["newsletter","writing","subscribers"] },
    { name: "Charity & Nonprofit", desc: "Volunteer coordination, fundraising campaigns, donor management, and event planning.", tags: ["nonprofit","charity","volunteers"] },
    { name: "Church & Ministry", desc: "Service planning, prayer requests, bible study groups, and event coordination.", tags: ["church","ministry","faith"] },
    { name: "Family & Friends Circle", desc: "Event planning, photo sharing, recipe exchange, and group coordination.", tags: ["family","friends","private"] },
    { name: "Wedding Planning", desc: "Vendor tracking, guest lists, timeline management, and bridal party coordination.", tags: ["wedding","planning","events"] },
    { name: "Car Enthusiasts Club", desc: "Build logs, meet coordination, parts marketplace, and technical help.", tags: ["cars","automotive","builds"] },
    { name: "Gardening Society", desc: "Plant care guides, garden photos, seed exchanges, and seasonal planning.", tags: ["gardening","plants","outdoor"] },
    { name: "Homelab & Self-Hosting", desc: "Server builds, Docker configs, network diagrams, and service recommendations.", tags: ["homelab","self-hosting","docker"] },
  ],
};

function makePlan(name: string, category: string) {
  const ch = (n: string, type = "text") => ({ name: n, type, topic: `${n} discussion` });
  const basePlan: any = {
    server: { name, description: `${name} — powered by GuildForge` },
    categories: [
      { name: "📢 Information", channels: [ch("welcome"), ch("rules"), ch("announcements")] },
      { name: "💬 General", channels: [ch("general"), ch("introductions"), ch("off-topic")] },
      { name: "🔧 Main", channels: [ch("discussion"), ch("resources"), ch("showcase")] },
      { name: "🔊 Voice", channels: [ch("General Voice", "voice"), ch("Meeting Room", "voice")] },
    ],
    roles: [
      { name: "Admin", color: "#e74c3c", permissions: ["ADMINISTRATOR"] },
      { name: "Moderator", color: "#e67e22", permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS"] },
      { name: "Member", color: "#3498db", permissions: ["SEND_MESSAGES", "CONNECT"] },
    ],
  };
  return basePlan;
}

async function main() {
  // Ensure a system user exists for authoring templates
  let systemUser = await prisma.user.findFirst({ where: { username: "guildforge-system" } });
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: { discordId: "000000000000000000", username: "guildforge-system", avatar: null, email: "system@guildforge.dev" },
    });
  }

  let count = 0;
  for (const [category, templates] of Object.entries(CATEGORIES)) {
    for (const t of templates) {
      const exists = await prisma.serverTemplate.findFirst({ where: { name: t.name, category } });
      if (exists) continue;
      await prisma.serverTemplate.create({
        data: {
          name: t.name,
          description: t.desc,
          category,
          tags: t.tags,
          planJson: makePlan(t.name, category),
          authorId: systemUser.id,
          isPublic: true,
          starCount: Math.floor(Math.random() * 200) + 10,
          useCount: Math.floor(Math.random() * 500) + 5,
        },
      });
      count++;
    }
  }
  console.log(`✅ Seeded ${count} templates (${Object.keys(CATEGORIES).length} categories)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
