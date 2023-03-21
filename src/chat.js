import { ChatGPTAPI } from 'chatgpt';

export class Chat {
  constructor(apiKey) {
    this.chatAPI = new ChatGPTAPI({
      apiKey,
      completionParams: {
        model: process.env.MODEL || 'gpt-3.5-turbo',
        temperature: +(process.env.temperature || 0) || 1,
        top_p: +(process.env.temperature || 0) || 1,
      },
    });
  }

  generatePrompt = (patch) => {
    return `Bellow is the code patch, please help me do a brief code review, Answer me in Korean if any bug risk and improvement suggestion are welcome
${patch}
`;
  };

  codeReview = async (patch) => {
    if (!patch) {
      return '';
    }
    const prompt = this.generatePrompt(patch);
    const res = await this.chatAPI.sendMessage(prompt);
    return res;
  };
}
