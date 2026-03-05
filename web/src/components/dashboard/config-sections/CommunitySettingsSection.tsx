'use client';

import { ToggleSwitch } from '@/components/dashboard/toggle-switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChannelSelector } from '@/components/ui/channel-selector';
import { Input } from '@/components/ui/input';
import { RoleSelector } from '@/components/ui/role-selector';
import type { BotConfig, DeepPartial } from '@/types/config';

type GuildConfig = DeepPartial<BotConfig>;
type Badge = { days?: number; label?: string };

interface CommunitySettingsSectionProps {
  draftConfig: GuildConfig;
  saving: boolean;
  guildId: string;
  inputClasses: string;
  defaultActivityBadges: readonly { days: number; label: string }[];
  parseNumberInput: (raw: string, min?: number, max?: number) => number | undefined;
  updateDraftConfig: (updater: (prev: GuildConfig) => GuildConfig) => void;
}

export function CommunitySettingsSection({
  draftConfig,
  saving,
  guildId,
  inputClasses,
  defaultActivityBadges,
  parseNumberInput,
  updateDraftConfig,
}: CommunitySettingsSectionProps) {
  return (
    <>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Community Features</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Enable or disable community commands per guild.
          </p>
          {(
            [
              { key: 'help', label: 'Help / FAQ', desc: '/help command for server knowledge base' },
              { key: 'announce', label: 'Announcements', desc: '/announce for scheduled messages' },
              {
                key: 'snippet',
                label: 'Code Snippets',
                desc: '/snippet for saving and sharing code',
              },
              { key: 'poll', label: 'Polls', desc: '/poll for community voting' },
              {
                key: 'showcase',
                label: 'Project Showcase',
                desc: '/showcase to submit, browse, and upvote projects',
              },
              {
                key: 'review',
                label: 'Code Reviews',
                desc: '/review peer code review requests with claim workflow',
              },
              { key: 'tldr', label: 'TL;DR Summaries', desc: '/tldr for AI channel summaries' },
              { key: 'afk', label: 'AFK System', desc: '/afk auto-respond when members are away' },
              {
                key: 'engagement',
                label: 'Engagement Tracking',
                desc: '/profile stats — messages, reactions, days active',
              },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{label}</span>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ToggleSwitch
                checked={draftConfig[key]?.enabled ?? false}
                onChange={(v) => {
                  updateDraftConfig((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], enabled: v },
                  }));
                }}
                disabled={saving}
                label={label}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <CardTitle className="text-base">Activity Badges</CardTitle>
          <p className="text-xs text-muted-foreground">
            Configure the badge tiers shown on /profile. Each badge requires a minimum number of
            active days.
          </p>
          {(draftConfig.engagement?.activityBadges ?? defaultActivityBadges).map(
            (badge: Badge, i: number) => (
              <div
                key={`badge-${badge.days ?? 0}-${badge.label ?? i}`}
                className="flex items-center gap-2"
              >
                <Input
                  className="w-20"
                  type="number"
                  min={0}
                  value={badge.days ?? 0}
                  onChange={(e) => {
                    const badges = [
                      ...(draftConfig.engagement?.activityBadges ?? defaultActivityBadges),
                    ];
                    badges[i] = {
                      ...badges[i],
                      days: Math.max(0, parseInt(e.target.value, 10) || 0),
                    };
                    updateDraftConfig((prev) => ({
                      ...prev,
                      engagement: { ...prev.engagement, activityBadges: badges },
                    }));
                  }}
                  disabled={saving}
                />
                <span className="text-xs text-muted-foreground">days →</span>
                <Input
                  className="flex-1"
                  value={badge.label ?? ''}
                  onChange={(e) => {
                    const badges = [
                      ...(draftConfig.engagement?.activityBadges ?? defaultActivityBadges),
                    ];
                    badges[i] = { ...badges[i], label: e.target.value };
                    updateDraftConfig((prev) => ({
                      ...prev,
                      engagement: { ...prev.engagement, activityBadges: badges },
                    }));
                  }}
                  disabled={saving}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const badges = [...(draftConfig.engagement?.activityBadges ?? [])].filter(
                      (_, idx) => idx !== i,
                    );
                    updateDraftConfig((prev) => ({
                      ...prev,
                      engagement: { ...prev.engagement, activityBadges: badges },
                    }));
                  }}
                  disabled={
                    saving ||
                    (draftConfig.engagement?.activityBadges ?? defaultActivityBadges).length <= 1
                  }
                >
                  ✕
                </Button>
              </div>
            ),
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const badges = [
                ...(draftConfig.engagement?.activityBadges ?? defaultActivityBadges),
                { days: 0, label: '🌟 New Badge' },
              ];
              updateDraftConfig((prev) => ({
                ...prev,
                engagement: { ...prev.engagement, activityBadges: badges },
              }));
            }}
            disabled={saving}
          >
            + Add Badge
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Reputation / XP</CardTitle>
            <ToggleSwitch
              checked={draftConfig.reputation?.enabled ?? false}
              onChange={(v) =>
                updateDraftConfig((prev) => ({
                  ...prev,
                  reputation: { ...prev.reputation, enabled: v },
                }))
              }
              disabled={saving}
              label="Reputation"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="xp-per-message-min" className="space-y-2">
              <span className="text-sm font-medium">XP per Message (min)</span>
              <input
                id="xp-per-message-min"
                type="number"
                min={1}
                max={100}
                value={draftConfig.reputation?.xpPerMessage?.[0] ?? 5}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 1, 100);
                  if (num !== undefined) {
                    const range = draftConfig.reputation?.xpPerMessage ?? [5, 15];
                    const newMax = num > range[1] ? num : range[1];
                    updateDraftConfig((prev) => ({
                      ...prev,
                      reputation: { ...prev.reputation, xpPerMessage: [num, newMax] },
                    }));
                  }
                }}
                disabled={saving}
                className={inputClasses}
              />
            </label>
            <label htmlFor="xp-per-message-max" className="space-y-2">
              <span className="text-sm font-medium">XP per Message (max)</span>
              <input
                id="xp-per-message-max"
                type="number"
                min={1}
                max={100}
                value={draftConfig.reputation?.xpPerMessage?.[1] ?? 15}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 1, 100);
                  if (num !== undefined) {
                    const range = draftConfig.reputation?.xpPerMessage ?? [5, 15];
                    const newMin = num < range[0] ? num : range[0];
                    updateDraftConfig((prev) => ({
                      ...prev,
                      reputation: { ...prev.reputation, xpPerMessage: [newMin, num] },
                    }));
                  }
                }}
                disabled={saving}
                className={inputClasses}
              />
            </label>
            <label htmlFor="xp-cooldown-seconds" className="space-y-2">
              <span className="text-sm font-medium">XP Cooldown (seconds)</span>
              <input
                id="xp-cooldown-seconds"
                type="number"
                min={0}
                value={draftConfig.reputation?.xpCooldownSeconds ?? 60}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 0);
                  if (num !== undefined)
                    updateDraftConfig((prev) => ({
                      ...prev,
                      reputation: { ...prev.reputation, xpCooldownSeconds: num },
                    }));
                }}
                disabled={saving}
                className={inputClasses}
              />
            </label>
            <label htmlFor="announce-channel-id" className="space-y-2">
              <span className="text-sm font-medium">Announce Channel ID</span>
              <ChannelSelector
                id="announce-channel-id"
                guildId={guildId}
                selected={
                  draftConfig.reputation?.announceChannelId
                    ? [draftConfig.reputation.announceChannelId]
                    : []
                }
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    reputation: {
                      ...prev.reputation,
                      announceChannelId: selected[0] ?? null,
                    },
                  }))
                }
                disabled={saving}
                placeholder="Select announcement channel"
                maxSelections={1}
                filter="text"
              />
            </label>
          </div>
          <label htmlFor="level-thresholds-comma-separated" className="space-y-2">
            <span className="text-sm font-medium">
              Level Thresholds (comma-separated XP values)
            </span>
            <input
              id="level-thresholds-comma-separated"
              type="text"
              value={(
                draftConfig.reputation?.levelThresholds ?? [
                  100, 300, 600, 1000, 1500, 2500, 4000, 6000, 8500, 12000,
                ]
              ).join(', ')}
              onChange={(e) => {
                const nums = e.target.value
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter((n) => Number.isFinite(n) && n > 0);
                if (nums.length > 0) {
                  const sorted = [...nums].sort((a, b) => a - b);
                  updateDraftConfig((prev) => ({
                    ...prev,
                    reputation: { ...prev.reputation, levelThresholds: sorted },
                  }));
                }
              }}
              disabled={saving}
              className={inputClasses}
              placeholder="100, 300, 600, 1000, ..."
            />
            <p className="text-xs text-muted-foreground">
              XP required for each level (L1, L2, L3, ...). Add more values for more levels.
            </p>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daily Coding Challenges</CardTitle>
            <ToggleSwitch
              checked={draftConfig.challenges?.enabled ?? false}
              onChange={(v) =>
                updateDraftConfig((prev) => ({
                  ...prev,
                  challenges: { ...prev.challenges, enabled: v },
                }))
              }
              disabled={saving}
              label="Challenges"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-post a daily coding challenge with hint and solve tracking.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="challenge-channel-id" className="space-y-2">
              <span className="text-sm font-medium">Challenge Channel ID</span>
              <ChannelSelector
                id="challenge-channel-id"
                guildId={guildId}
                selected={
                  draftConfig.challenges?.channelId ? [draftConfig.challenges.channelId] : []
                }
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    challenges: {
                      ...prev.challenges,
                      channelId: selected[0] ?? null,
                    },
                  }))
                }
                disabled={saving}
                placeholder="Select challenges channel"
                maxSelections={1}
                filter="text"
              />
            </label>
            <label htmlFor="post-time-hh-mm" className="space-y-2">
              <span className="text-sm font-medium">Post Time (HH:MM)</span>
              <input
                id="post-time-hh-mm"
                type="text"
                value={draftConfig.challenges?.postTime ?? '09:00'}
                onChange={(e) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    challenges: { ...prev.challenges, postTime: e.target.value },
                  }))
                }
                disabled={saving}
                className={inputClasses}
                placeholder="09:00"
              />
            </label>
            <label className="col-span-2 space-y-2">
              <span className="text-sm font-medium">Timezone</span>
              <input
                type="text"
                value={draftConfig.challenges?.timezone ?? 'America/New_York'}
                onChange={(e) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    challenges: { ...prev.challenges, timezone: e.target.value },
                  }))
                }
                disabled={saving}
                className={inputClasses}
                placeholder="America/New_York"
              />
              <p className="text-xs text-muted-foreground">
                IANA timezone (e.g. America/Chicago, Europe/London)
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">GitHub Activity Feed</CardTitle>
            <ToggleSwitch
              checked={draftConfig.github?.feed?.enabled ?? false}
              onChange={(v) =>
                updateDraftConfig((prev) => ({
                  ...prev,
                  github: { ...prev.github, feed: { ...prev.github?.feed, enabled: v } },
                }))
              }
              disabled={saving}
              label="GitHub Feed"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="feed-channel-id" className="space-y-2">
              <span className="text-sm font-medium">Feed Channel ID</span>
              <ChannelSelector
                id="feed-channel-id"
                guildId={guildId}
                selected={
                  draftConfig.github?.feed?.channelId ? [draftConfig.github.feed.channelId] : []
                }
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    github: {
                      ...prev.github,
                      feed: { ...prev.github?.feed, channelId: selected[0] ?? null },
                    },
                  }))
                }
                disabled={saving}
                placeholder="Select GitHub feed channel"
                maxSelections={1}
                filter="text"
              />
            </label>
            <label htmlFor="poll-interval-minutes" className="space-y-2">
              <span className="text-sm font-medium">Poll Interval (minutes)</span>
              <input
                id="poll-interval-minutes"
                type="number"
                min={1}
                value={draftConfig.github?.feed?.pollIntervalMinutes ?? 5}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 1);
                  if (num !== undefined) {
                    updateDraftConfig((prev) => ({
                      ...prev,
                      github: {
                        ...prev.github,
                        feed: { ...prev.github?.feed, pollIntervalMinutes: num },
                      },
                    }));
                  }
                }}
                disabled={saving}
                className={inputClasses}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tickets</CardTitle>
            <ToggleSwitch
              checked={draftConfig.tickets?.enabled ?? false}
              onChange={(v) =>
                updateDraftConfig((prev) => ({
                  ...prev,
                  tickets: { ...prev.tickets, enabled: v },
                }))
              }
              disabled={saving}
              label="Tickets"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label htmlFor="ticket-mode" className="space-y-2">
            <span className="text-sm font-medium">Ticket Mode</span>
            <select
              id="ticket-mode"
              value={draftConfig.tickets?.mode ?? 'thread'}
              onChange={(e) =>
                updateDraftConfig((prev) => ({
                  ...prev,
                  tickets: { ...prev.tickets, mode: e.target.value as 'thread' | 'channel' },
                }))
              }
              disabled={saving}
              className={inputClasses}
            >
              <option value="thread">Thread (private thread per ticket)</option>
              <option value="channel">Channel (dedicated text channel per ticket)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Thread mode creates private threads. Channel mode creates locked text channels with
              permission overrides.
            </p>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="support-role-id" className="space-y-2">
              <span className="text-sm font-medium">Support Role ID</span>
              <RoleSelector
                id="support-role-id"
                guildId={guildId}
                selected={draftConfig.tickets?.supportRole ? [draftConfig.tickets.supportRole] : []}
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    tickets: { ...prev.tickets, supportRole: selected[0] ?? null },
                  }))
                }
                disabled={saving}
                placeholder="Select support role"
                maxSelections={1}
              />
            </label>
            <label htmlFor="category-channel-id" className="space-y-2">
              <span className="text-sm font-medium">Category Channel ID</span>
              <ChannelSelector
                id="category-channel-id"
                guildId={guildId}
                selected={draftConfig.tickets?.category ? [draftConfig.tickets.category] : []}
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    tickets: { ...prev.tickets, category: selected[0] ?? null },
                  }))
                }
                disabled={saving}
                placeholder="Select ticket category"
                maxSelections={1}
                filter="all"
              />
            </label>
            <label htmlFor="auto-close-hours" className="space-y-2">
              <span className="text-sm font-medium">Auto-Close Hours</span>
              <input
                id="auto-close-hours"
                type="number"
                min="1"
                max="720"
                value={draftConfig.tickets?.autoCloseHours ?? 48}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 1, 720);
                  if (num !== undefined) {
                    updateDraftConfig((prev) => ({
                      ...prev,
                      tickets: { ...prev.tickets, autoCloseHours: num },
                    }));
                  }
                }}
                disabled={saving}
                className={inputClasses}
              />
              <p className="text-xs text-muted-foreground">
                Hours of inactivity before warning (then +24h to close)
              </p>
            </label>
            <label htmlFor="max-open-per-user" className="space-y-2">
              <span className="text-sm font-medium">Max Open Per User</span>
              <input
                id="max-open-per-user"
                type="number"
                min="1"
                max="20"
                value={draftConfig.tickets?.maxOpenPerUser ?? 3}
                onChange={(e) => {
                  const num = parseNumberInput(e.target.value, 1, 20);
                  if (num !== undefined) {
                    updateDraftConfig((prev) => ({
                      ...prev,
                      tickets: { ...prev.tickets, maxOpenPerUser: num },
                    }));
                  }
                }}
                disabled={saving}
                className={inputClasses}
              />
            </label>
            <label htmlFor="transcript-channel-id" className="col-span-2 space-y-2">
              <span className="text-sm font-medium">Transcript Channel ID</span>
              <ChannelSelector
                id="transcript-channel-id"
                guildId={guildId}
                selected={
                  draftConfig.tickets?.transcriptChannel
                    ? [draftConfig.tickets.transcriptChannel]
                    : []
                }
                onChange={(selected) =>
                  updateDraftConfig((prev) => ({
                    ...prev,
                    tickets: { ...prev.tickets, transcriptChannel: selected[0] ?? null },
                  }))
                }
                disabled={saving}
                placeholder="Select transcript channel"
                maxSelections={1}
                filter="text"
              />
            </label>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
