import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @ApiProperty()
  boardId: string;

  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsInt()
  @ApiProperty({ required: true })
  @IsEqualToBreakdowSum('breakdown')
  totalAmount: number;

  @IsNotEmpty()
  @ApiProperty()
  paidBy: string;

  @ApiProperty()
  breakdown: ExpenseDetailDto[];
}

class ExpenseDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paidForId: string;

  @ApiProperty()
  @IsInt()
  amount: number;
}

export function IsEqualToBreakdowSum(
  property: string,
  options?: ValidationOptions
) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      name: 'isEqualToBreakdowSum',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            value ===
            relatedValue.reduce(
              (acc, expenseItem) => acc + expenseItem.amount,
              0
            )
          );
        },
        defaultMessage(): string {
          return `The total amount of ${propertyName} is not equal to the sum of ${property}`;
        },
      },
    });
  };
}
