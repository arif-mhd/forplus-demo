const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

// Default Style Config
const DEFAULT_STYLE = {
    primaryColor: '#000000',
    secondaryColor: '#4b5563',
    fontFamily: 'Helvetica',
    headerBg: '#f3f4f6'
};

const compileTemplate = async (templateName, data) => {
    const filePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
    const html = await fs.readFile(filePath, 'utf-8');
    return handlebars.compile(html)(data);
};

const generatePdf = async (type, data, styleConfig = {}) => {
    let browser;
    try {
        const mergedStyle = { ...DEFAULT_STYLE, ...styleConfig };

        // Inject style config into data context for handlebars
        console.log('Generating PDF with Style Config:', mergedStyle);
        const templateData = {
            ...data,
            styleConfig: mergedStyle
        };

        const content = await compileTemplate(type, templateData);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        return pdfBuffer;
    } catch (error) {
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = {
    generatePdf
};
