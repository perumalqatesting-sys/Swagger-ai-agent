const createResolved = jest.fn().mockResolvedValue({
  choices: [{ message: { content: "{\"ok\":true}" } }],
});

export class OpenAI {
  chat = {
    completions: {
      create: createResolved,
    },
  };
  responses = {
    create: jest.fn().mockResolvedValue({
      output: [],
      output_text: '',
    }),
  };
}

export default { OpenAI };
