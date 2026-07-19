import { User } from '../models/user.model.js'
import { Company } from '../models/company.model.js'
import { DSAProblem, DSATopic, DSARoadmap, DSARevision, DSASession } from '../models/dsa.model.js'
import { Goal } from '../models/goal.model.js'
import { Achievement } from '../models/achievement.model.js'
import { Notification } from '../models/notification.model.js'
import { PlannerTask } from '../models/planner.model.js'
import mongoose from 'mongoose'

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const user = await User.create({
      name: 'Alex Rivera',
      email: 'alex@school.edu',
      password: 'password123',
      username: 'alexr',
      season: 'Fall 2026',
      school: 'Institute of Technology',
      program: 'B.Tech CS',
      location: 'Bangalore, IN',
      timezone: 'IST',
      skills: ['TypeScript', 'Go', 'Postgres', 'Distributed systems'],
      publicLinks: {
        github: 'github.com/alexr',
        linkedin: 'linkedin.com/in/alexrivera',
        portfolio: 'alexrivera.dev',
      },
    })

    const companies = await Company.insertMany([
      {
        code: 'STRP',
        name: 'Stripe',
        role: 'Product Engineer',
        stage: 'Final Round',
        progress: 85,
        status: 'hot',
        nextStep: 'Oct 28 · Bar Raiser',
        location: 'Remote',
        userId: user._id,
      },
      {
        code: 'LNR',
        name: 'Linear',
        role: 'Frontend Engineer',
        stage: 'Technical II',
        progress: 55,
        status: 'active',
        nextStep: 'Oct 26 · Code pairing',
        location: 'San Francisco',
        userId: user._id,
      },
      {
        code: 'VER',
        name: 'Vercel',
        role: 'Platform Engineer',
        stage: 'Offer Extended',
        progress: 100,
        status: 'offer',
        nextStep: 'Decision by Nov 10',
        location: 'Remote',
        userId: user._id,
      },
    ])

    const dsaTopics = await DSATopic.insertMany([
      { topic: 'Arrays & Hashing', solved: 62, total: 68, mastery: 92, trend: 'up', userId: user._id },
      { topic: 'Two Pointers', solved: 24, total: 28, mastery: 88, trend: 'up', userId: user._id },
      { topic: 'Sliding Window', solved: 18, total: 24, mastery: 76, trend: 'flat', userId: user._id },
      { topic: 'Trees', solved: 34, total: 48, mastery: 74, trend: 'up', userId: user._id },
    ])

    const dsaProblems = await DSAProblem.insertMany([
      { title: 'Two Sum', problemId: '1', topic: 'Arrays & Hashing', difficulty: 'easy', platform: 'leetcode', status: 'solved', solvedAt: new Date(), userId: user._id, companiesAsked: ['Google', 'Amazon'] },
      { title: 'Longest Substring Without Repeating Characters', problemId: '3', topic: 'Sliding Window', difficulty: 'medium', platform: 'leetcode', status: 'solved', solvedAt: new Date(), userId: user._id, companiesAsked: ['Google', 'Facebook'] },
      { title: 'Binary Tree Level Order Traversal', problemId: '102', topic: 'Trees', difficulty: 'medium', platform: 'leetcode', status: 'started', userId: user._id, companiesAsked: ['Amazon', 'Microsoft'] },
      { title: 'Trapping Rain Water', problemId: '42', topic: 'Two Pointers', difficulty: 'hard', platform: 'leetcode', status: 'not_started', userId: user._id, companiesAsked: ['Google', 'Amazon', 'Facebook'] },
    ])

    const neetCodeRoadmap = await DSARoadmap.create({
      name: 'NeetCode 150',
      type: 'neetCode150',
      description: 'Essential coding interview problems',
      userId: user._id,
      isActive: true,
      problems: dsaProblems.slice(0, 3).map((p, i) => ({
        problemId: p._id,
        order: i + 1,
        status: i < 2 ? 'completed' : 'in_progress',
      })),
      totalProblems: 3,
      completedProblems: 2,
      progress: 67,
    })

    await DSARevision.insertMany([
      { problem: dsaProblems[0]._id, problemTitle: dsaProblems[0].title, problemDifficulty: 'easy', problemTopic: 'Arrays & Hashing', dueDate: new Date(Date.now() + 86400000), revisionCount: 1, interval: 1, userId: user._id },
      { problem: dsaProblems[1]._id, problemTitle: dsaProblems[1].title, problemDifficulty: 'medium', problemTopic: 'Sliding Window', dueDate: new Date(Date.now() + 3 * 86400000), revisionCount: 1, interval: 3, userId: user._id },
    ])

    await DSASession.create({
      title: 'Morning Practice',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(),
      problemsSolved: 3,
      problemsAttempted: 4,
      accuracy: 75,
      focusScore: 85,
      streak: 5,
      mood: 'great',
      difficultyDistribution: { easy: 2, medium: 1, hard: 1 },
      topicsPracticed: ['Arrays & Hashing', 'Trees'],
      userId: user._id,
    })

    const goals = await Goal.insertMany([
      { title: 'Solve 500 DSA problems', progress: 62, deadline: 'Dec 15', cadence: 'Weekly · 20/week', tone: 'brand', userId: user._id },
      { title: 'Reach 85 readiness score', progress: 87, deadline: 'Nov 30', cadence: 'Monthly review', tone: 'brand', userId: user._id },
    ])

    const achievements = await Achievement.insertMany([
      { title: 'First offer secured', meta: 'Vercel · Platform Engineer', when: '3 days ago', tier: 'gold', userId: user._id },
      { title: '100-problem streak', meta: 'Consistent daily practice', when: 'Last week', tier: 'silver', userId: user._id },
    ])

    const notifications = await Notification.insertMany([
      { title: 'Stripe scheduled a Bar Raiser', meta: 'Oct 28 · 14:00 UTC', when: '2h ago', tag: 'interview', userId: user._id },
      { title: 'Linear updated your application', meta: 'Moved to Technical II', when: '5h ago', tag: 'pipeline', userId: user._id },
    ])

    console.log('Seed data created successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seedData()