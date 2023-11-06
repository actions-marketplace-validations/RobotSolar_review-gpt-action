const { Configuration, OpenAIApi } = require("openai");

export class Chat {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  generatePrompt = (patch, ext) => {
    return `review the below code ${ext} and help me do a brief code review for code smells, potential scalability issues, any bug risk and suggest improvements if it's necessary, answer me in ${ process.env.LANG || "english" }, be short and concise.
${patch}
`;
  };

  codeReview = async (patch, ext) => {
    const prompt = this.generatePrompt(patch,);

    const { data } = await this.openai.createChatCompletion({
      model: process.env.MODEL || "gpt-3.5-turbo",
      temperature: +(process.env.temperature || 0) || 1,
      top_p: +(process.env.temperature || 0) || 1,
      messages: [{ role: "user", content: prompt }],
    });
    return data.choices[0];
  };
}
