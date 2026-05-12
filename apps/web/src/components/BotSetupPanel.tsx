import { useState, useEffect } from "react";
import { BuildPlan } from "@guildforge/plan-schema";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


export function BotSetupPanel({ plan, guildId }: { plan: BuildPlan, guildId: string }) {
  const [botStatus, setBotStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/guilds/${guildId}/bot-status`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setBotStatus(data.botSetupStatus || {});
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, [guildId]);

  const toggleBotStatus = async (botId: string, checked: boolean) => {
    const newStatus = { ...botStatus, [botId]: checked };
    setBotStatus(newStatus);
    try {
      await fetch(`${API}/guilds/${guildId}/bot-status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus)
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!plan.bots || plan.bots.length === 0) {
    return null;
  }

  const renderBotHelper = (botId: string) => {
    switch (botId) {
      case "carl-bot":
        return (
          <div className="mt-4 p-4 bg-zinc-900 rounded-md">
            <p className="text-sm text-zinc-400 mb-2">Helper: Copy this command to create a reaction role menu in your server.</p>
            <code className="text-xs bg-zinc-950 p-2 block rounded font-mono text-emerald-400 select-all">
              ?rr make #role-select &quot;Select your roles&quot; &quot;React below to get your roles!&quot;
            </code>
          </div>
        );
      case "mee6":
        return (
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => window.open(`https://mee6.xyz/dashboard/${guildId}`, "_blank")}>
              Open MEE6 Dashboard
            </Button>
          </div>
        );
      case "ticket-tool":
        return (
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => window.open(`https://tickettool.xyz/dashboard`, "_blank")}>
              Open Ticket Tool Dashboard
            </Button>
          </div>
        );
      case "sesh":
        return (
          <div className="mt-4 p-4 bg-zinc-900 rounded-md">
            <p className="text-sm text-zinc-400 mb-2">Helper: Use this command to create your first event.</p>
            <code className="text-xs bg-zinc-950 p-2 block rounded font-mono text-emerald-400 select-all">
              !create &quot;Weekly Meeting&quot; tomorrow at 5pm
            </code>
          </div>
        );
      case "wick":
        return (
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => window.open(`https://wickbot.com/dashboard/${guildId}`, "_blank")}>
              Open Wick Security Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Bot invite URLs based on our catalog
  const inviteUrls: Record<string, string> = {
    "carl-bot": "https://discord.com/oauth2/authorize?client_id=235148962103951360&permissions=8&scope=bot",
    "mee6": "https://discord.com/oauth2/authorize?client_id=159985870458322944&permissions=8&scope=bot",
    "ticket-tool": "https://discord.com/oauth2/authorize?client_id=557628352828014614&permissions=8&scope=bot",
    "sesh": "https://discord.com/oauth2/authorize?client_id=617037497574359050&permissions=8&scope=bot",
    "wick": "https://discord.com/oauth2/authorize?client_id=536982461168582656&permissions=8&scope=bot",
    "dyno": "https://discord.com/oauth2/authorize?client_id=155149108183695360&permissions=8&scope=bot",
    "probot": "https://discord.com/oauth2/authorize?client_id=282859044593598464&permissions=8&scope=bot",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mt-8 mb-4">Bot Integrations & Setup</h2>
      <p className="text-sm text-zinc-400 mb-6">Your server structure is ready! Now invite and configure the recommended bots to bring it to life.</p>
      
      {plan.bots.map((bot, i) => (
        <Card key={i} className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg capitalize">{bot.botId.replace("-", " ")}</CardTitle>
              <CardDescription className="mt-1">{bot.why}</CardDescription>
            </div>
            {inviteUrls[bot.botId] && (
              <Button 
                onClick={() => window.open(inviteUrls[bot.botId], "_blank")}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                Invite to Server
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Setup Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
                  {bot.setupSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {renderBotHelper(bot.botId)}

              <div className="flex items-center space-x-2 pt-4 border-t border-zinc-800">
                <input
                  type="checkbox"
                  id={`configured-${bot.botId}`} 
                  checked={!!botStatus[bot.botId]}
                  onChange={(e) => toggleBotStatus(bot.botId, e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label 
                  htmlFor={`configured-${bot.botId}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mark as configured
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
