import { AddNoteToBudgetHandler } from './add-note.handler';
import { AddNoteToBudgetCommand } from './add-note.command';

// Mock repository to track calls
const mockRepo = {
  addNote: jest.fn()
};

// Mock the @ngfire/functions module entirely
jest.mock('@ngfire/functions', () => ({
  getRepository: () => mockRepo,
  FunctionHandler: class {
    execute(command: any): Promise<void> {
      return Promise.resolve();
    }
  }
}));

describe('AddNoteToBudgetHandler', () => {
  let handler: AddNoteToBudgetHandler;

  beforeEach(() => {
    handler = new AddNoteToBudgetHandler();
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should throw error if fields are missing', async () => {
    await expect(
      handler.execute(new AddNoteToBudgetCommand('', '', ''))
    ).rejects.toThrow();
  });

  it('should call addNote on the repo', async () => {
    const command = new AddNoteToBudgetCommand('budget-1', 'My note', 'user-1');

    await handler.execute(command);

    expect(mockRepo.addNote).toHaveBeenCalledWith({
      budgetId: command.budgetId,
      content: command.content,
      createdBy: command.createdBy
    });
  });
});
