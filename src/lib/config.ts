import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';
const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    CUSTOM_OPENAI: {
      API_URL: string;
      API_KEY: string;
      MODEL_NAME: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// Load config from TOML file
const loadTomlConfig = (): Config => {
  try {
    return toml.parse(
      fs.readFileSync(path.join(process.cwd(), `${configFileName}`), 'utf-8'),
    ) as any as Config;
  } catch (error) {
    console.warn(`Failed to load config file: ${error}`);
    // Return empty config if file doesn't exist or can't be parsed
    return {
      GENERAL: {
        SIMILARITY_MEASURE: '',
        KEEP_ALIVE: '',
      },
      MODELS: {
        OPENAI: { API_KEY: '' },
        GROQ: { API_KEY: '' },
        ANTHROPIC: { API_KEY: '' },
        GEMINI: { API_KEY: '' },
        OLLAMA: { API_URL: '' },
        CUSTOM_OPENAI: {
          API_URL: '',
          API_KEY: '',
          MODEL_NAME: '',
        },
      },
      API_ENDPOINTS: {
        SEARXNG: '',
      },
    };
  }
};

// Get config from environment variables or fallback to TOML
const getConfig = () => {
  const tomlConfig = loadTomlConfig();
  
  // Define the environment variable structure
  return {
    GENERAL: {
      SIMILARITY_MEASURE: process.env.SIMILARITY_MEASURE || tomlConfig.GENERAL.SIMILARITY_MEASURE,
      KEEP_ALIVE: process.env.KEEP_ALIVE || tomlConfig.GENERAL.KEEP_ALIVE,
    },
    MODELS: {
      OPENAI: {
        API_KEY: process.env.OPENAI_API_KEY || tomlConfig.MODELS.OPENAI.API_KEY,
      },
      GROQ: {
        API_KEY: process.env.GROQ_API_KEY || tomlConfig.MODELS.GROQ.API_KEY,
      },
      ANTHROPIC: {
        API_KEY: process.env.ANTHROPIC_API_KEY || tomlConfig.MODELS.ANTHROPIC.API_KEY,
      },
      GEMINI: {
        API_KEY: process.env.GEMINI_API_KEY || tomlConfig.MODELS.GEMINI.API_KEY,
      },
      OLLAMA: {
        API_URL: process.env.OLLAMA_API_URL || tomlConfig.MODELS.OLLAMA.API_URL,
      },
      CUSTOM_OPENAI: {
        API_URL: process.env.CUSTOM_OPENAI_API_URL || tomlConfig.MODELS.CUSTOM_OPENAI.API_URL,
        API_KEY: process.env.CUSTOM_OPENAI_API_KEY || tomlConfig.MODELS.CUSTOM_OPENAI.API_KEY,
        MODEL_NAME: process.env.CUSTOM_OPENAI_MODEL_NAME || tomlConfig.MODELS.CUSTOM_OPENAI.MODEL_NAME,
      },
    },
    API_ENDPOINTS: {
      SEARXNG: process.env.SEARXNG_API_URL || tomlConfig.API_ENDPOINTS.SEARXNG,
    },
  };
};

// Getter functions - now using the combined config
export const getSimilarityMeasure = () => getConfig().GENERAL.SIMILARITY_MEASURE;
export const getKeepAlive = () => getConfig().GENERAL.KEEP_ALIVE;
export const getOpenaiApiKey = () => getConfig().MODELS.OPENAI.API_KEY;
export const getGroqApiKey = () => getConfig().MODELS.GROQ.API_KEY;
export const getAnthropicApiKey = () => getConfig().MODELS.ANTHROPIC.API_KEY;
export const getGeminiApiKey = () => getConfig().MODELS.GEMINI.API_KEY;
export const getSearxngApiEndpoint = () => getConfig().API_ENDPOINTS.SEARXNG;
export const getOllamaApiEndpoint = () => getConfig().MODELS.OLLAMA.API_URL;
export const getCustomOpenaiApiKey = () => getConfig().MODELS.CUSTOM_OPENAI.API_KEY;
export const getCustomOpenaiApiUrl = () => getConfig().MODELS.CUSTOM_OPENAI.API_URL;
export const getCustomOpenaiModelName = () => getConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME;

const mergeConfigs = (current: any, update: any): any => {
  if (update === null || update === undefined) {
    return current;
  }
  if (typeof current !== 'object' || current === null) {
    return update;
  }
  const result = { ...current };
  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const updateValue = update[key];
      if (
        typeof updateValue === 'object' &&
        updateValue !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = mergeConfigs(result[key], updateValue);
      } else if (updateValue !== undefined) {
        result[key] = updateValue;
      }
    }
  }
  return result;
};

export const updateConfig = (config: RecursivePartial<Config>) => {
  const currentConfig = loadTomlConfig();
  const mergedConfig = mergeConfigs(currentConfig, config);
  fs.writeFileSync(
    path.join(path.join(process.cwd(), `${configFileName}`)),
    toml.stringify(mergedConfig),
  );
};
