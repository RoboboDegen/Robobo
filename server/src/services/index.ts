import { prisma } from '@/lib/prisma'

export const robotService = {
  async findAll() {
    return prisma.robot.findMany()
  },

  async findByAddress(address: string) {
    return prisma.robot.findUnique({
      where: { address }
    })
  },

  async create(data: { address: string; name?: string; ownerId: string }) {
    return prisma.robot.create({
      data: {
        address: data.address,
        name: data.name,
        ownerId: data.ownerId
      }
    })
  },

  async update(address: string, data: { ownerId?: string, winCount?: number, loseCount?: number }) {
    return prisma.robot.update({
      where: { address },
      data
    })
  },

  async delete(address: string) {
    return prisma.robot.delete({
      where: { address }
    })
  }
} 