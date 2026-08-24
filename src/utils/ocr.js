// Exemplo de utils/ocr.js
import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'por'); // 'por' para português
    return text;
  } catch (error) {
    throw new Error("Falha ao processar OCR: " + error.message);
  }
};