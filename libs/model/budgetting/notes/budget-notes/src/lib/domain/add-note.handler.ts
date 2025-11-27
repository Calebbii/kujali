import { AddNoteToBudgetCommand } from './add-note.command';
import { FunctionHandler } from '@ngfire/functions'; // Adjust import based on your utils
import { AddNoteToBudgetResult } from './add-note-result.interface'; // define result interface
import { getRepository } from '@ngfire/functions'; // toolkit for repo access

export interface ICommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}

export class AddNoteToBudgetHandler
  extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult>
  implements ICommandHandler<AddNoteToBudgetCommand>
{
  async execute(command: AddNoteToBudgetCommand): Promise<void> {
    const { budgetId, content, createdBy } = command;

    if (!budgetId || !content || !createdBy) {
      throw new Error('All fields are required.');
    }

    const repo = getRepository('BudgetNotes'); // replace with actual repo name
    await repo.addNote({ budgetId, content, createdBy });
  }
}
