import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
    private entityManager: EntityManager,
  ) {}

  async runInTransaction<T>(
    callback: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.entityManager.transaction(callback);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByWhatsappId(whatsappId: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { whatsappId } });
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = this.repository.create(createUserDto);
    return this.repository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    await this.repository.update(id, updateUserDto);
  }

  async softDelete(whatsappId: string): Promise<void> {
    const user = await this.findByWhatsappId(whatsappId);
    if (user) {
      await this.repository.softDelete(user.id);
    }
  }

  async restore(whatsappId: string): Promise<void> {
    const user = await this.findByWhatsappId(whatsappId);
    if (user) {
      await this.update(user.id, { deletedAt: null });
    }
  }
}
