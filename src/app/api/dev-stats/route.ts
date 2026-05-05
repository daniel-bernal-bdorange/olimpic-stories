import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type DevelopmentStats = {
  totalCommits: number;
  activeDays: number;
  calendarDays: number;
  storyCount: number;
  firstCommitDate: string;
  lastCommitDate: string;
  latestCommitSubject: string;
  source: 'git' | 'fallback';
};

const fallbackStats: DevelopmentStats = {
  totalCommits: 61,
  activeDays: 8,
  calendarDays: 15,
  storyCount: 4,
  firstCommitDate: '2026-04-21',
  lastCommitDate: '2026-05-05',
  latestCommitSubject: 'feat: polish home and story editorial presentation',
  source: 'fallback',
};

export const dynamic = 'force-dynamic';

function trimOutput(value: string) {
  return value.trim();
}

function getCalendarDays(firstCommitDate: string, lastCommitDate: string) {
  const firstDate = new Date(`${firstCommitDate}T00:00:00Z`);
  const lastDate = new Date(`${lastCommitDate}T00:00:00Z`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round((lastDate.getTime() - firstDate.getTime()) / millisecondsPerDay);

  return Math.max(1, diffInDays + 1);
}

async function runGit(args: string[]) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: process.cwd(),
    maxBuffer: 1024 * 1024,
  });

  return trimOutput(stdout);
}

async function readDevelopmentStats(): Promise<DevelopmentStats> {
  const [totalCommitsRaw, commitDatesRaw, latestCommitSubject] = await Promise.all([
    runGit(['rev-list', '--count', 'HEAD']),
    runGit(['log', '--format=%cs']),
    runGit(['log', '--format=%s', '-1']),
  ]);

  const commitDates = commitDatesRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (commitDates.length === 0) {
    throw new Error('No commits found in git history.');
  }

  const activeDays = new Set(commitDates).size;
  const lastCommitDate = commitDates[0];
  const firstCommitDate = commitDates[commitDates.length - 1];

  return {
    totalCommits: Number.parseInt(totalCommitsRaw, 10),
    activeDays,
    calendarDays: getCalendarDays(firstCommitDate, lastCommitDate),
    storyCount: 4,
    firstCommitDate,
    lastCommitDate,
    latestCommitSubject,
    source: 'git',
  };
}

export async function GET() {
  try {
    const stats = await readDevelopmentStats();
    return Response.json(stats, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(fallbackStats, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}