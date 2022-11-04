import { InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from 'src/common/order/order';

export enum BoardOrderField {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  published = 'published',
  title = 'title',
}

registerEnumType(BoardOrderField, {
  name: 'BoardOrderField',
  description: 'Properties by which boards connections can be ordered.',
});

@InputType()
export class BoardsOrder extends Order {
  field: BoardOrderField;
}
