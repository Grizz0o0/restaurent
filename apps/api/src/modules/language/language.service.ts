import { Injectable, NotFoundException } from '@nestjs/common'
import { LanguageRepo } from './language.repo'
import { CreateLanguageBodyType, GetLanguagesQueryType, UpdateLanguageBodyType } from '@repo/schema'
import { createPaginationResult } from '@/shared/utils/pagination.util'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepo: LanguageRepo) {}

  async create(data: CreateLanguageBodyType & { createdById: string }) {
    // Check if exists? Prisma will throw error on duplicate ID (PK).
    return await this.languageRepo.create(data)
  }

  async update(id: string, data: UpdateLanguageBodyType, updatedById: string) {
    const language = await this.languageRepo.findById(id)
    if (!language) throw new NotFoundException('Language not found')
    return await this.languageRepo.update(id, data, updatedById)
  }

  async findById(id: string) {
    const language = await this.languageRepo.findById(id)
    if (!language) throw new NotFoundException('Language not found')
    return language
  }

  async list(query: GetLanguagesQueryType) {
    const { total, data: languages } = await this.languageRepo.list(query)
    return createPaginationResult(languages, total, query)
  }

  async delete(id: string, deletedById: string) {
    const language = await this.languageRepo.findById(id)
    if (!language) throw new NotFoundException('Language not found')
    return await this.languageRepo.delete(id, deletedById)
  }
}
