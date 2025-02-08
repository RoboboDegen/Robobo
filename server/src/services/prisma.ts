import { PrismaClient } from '@prisma/client'

export class PrismaService {
    private static instance: PrismaService
    private prisma: PrismaClient

    private constructor() {
        this.prisma = new PrismaClient()
    }

    public static getInstance(): PrismaService {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService()
        }
        return PrismaService.instance
    }

    public getClient(): PrismaClient {
        return this.prisma
    }

    public async disconnect(): Promise<void> {
        await this.prisma.$disconnect()
    }
} 