// Data Science Portfolio Demo Content
// This file contains sample content for demonstrating the platform's capabilities
// for data science students during the Black Owls graduation presentation

export const dataSciencePortfolioContent = [
    {
        children: [{ text: '🎓 Black Owls Data Science Portfolio' }],
        type: 'h1',
    },
    {
        children: [
            { text: 'A showcase of machine learning projects, data analysis, and visualization work completed during the Code Academy Berlin Data Science Bootcamp.' },
        ],
        type: 'p',
    },

    // Project 1: Climate Analysis
    {
        children: [{ text: '🌡️ Climate Data Analysis Project' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'This project analyzes global temperature trends using Python, Pandas, and Matplotlib to visualize climate change patterns across different regions.' },
        ],
        type: 'p',
    },
    {
        children: [
            { text: '📊 Key Findings:' },
        ],
        type: 'h3',
    },
    {
        children: [
            { text: 'Global temperature has increased by 1.2°C since pre-industrial times' },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
    },
    {
        children: [
            { text: 'Arctic regions show the most dramatic warming patterns' },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
    },
    {
        children: [
            { text: 'Data reveals accelerating trends in the past two decades' },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
    },

    // Code Block with Python
    {
        children: [
            { children: [{ text: 'import pandas as pd' }], type: 'code_line' },
            { children: [{ text: 'import matplotlib.pyplot as plt' }], type: 'code_line' },
            { children: [{ text: 'import seaborn as sns' }], type: 'code_line' },
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: '# Load climate data' }], type: 'code_line' },
            { children: [{ text: "df = pd.read_csv('global_temperatures.csv')" }], type: 'code_line' },
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: '# Create stunning visualization' }], type: 'code_line' },
            { children: [{ text: 'plt.figure(figsize=(12, 8))' }], type: 'code_line' },
            { children: [{ text: "sns.set_palette('viridis')" }], type: 'code_line' },
            { children: [{ text: 'sns.lineplot(data=df, x="Year", y="Temperature")' }], type: 'code_line' },
            { children: [{ text: 'plt.title("Global Temperature Trends 1880-2023")' }], type: 'code_line' },
            { children: [{ text: 'plt.show()' }], type: 'code_line' },
        ],
        lang: 'python',
        type: 'code_block',
    },

    // Project 2: ML Model
    {
        children: [{ text: '🤖 Machine Learning: Stock Price Prediction' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'Built a neural network using TensorFlow to predict stock prices with 89% accuracy. The model uses LSTM architecture to capture temporal patterns in financial data.' },
        ],
        type: 'p',
    },

    // Callout for results
    {
        children: [
            {
                children: [
                    { text: '🎯 Model Performance: 89% accuracy on test data with RMSE of 0.034' },
                ],
                type: 'p',
            },
            {
                children: [
                    { text: '📈 Successfully predicted major market trends during volatile periods' },
                ],
                type: 'p',
            },
        ],
        type: 'callout',
        variant: 'info',
    },

    // Project 3: Data Visualization
    {
        children: [{ text: '📊 Interactive Dashboard: Social Media Analytics' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'Created an interactive dashboard using Plotly and Dash to analyze social media engagement patterns. Features real-time data processing and beautiful visualizations.' },
        ],
        type: 'p',
    },

    // Table showing results
    {
        children: [
            {
                children: [
                    {
                        children: [{ children: [{ bold: true, text: 'Metric' }], type: 'p' }],
                        type: 'th',
                    },
                    {
                        children: [{ children: [{ bold: true, text: 'Before Analysis' }], type: 'p' }],
                        type: 'th',
                    },
                    {
                        children: [{ children: [{ bold: true, text: 'After Optimization' }], type: 'p' }],
                        type: 'th',
                    },
                    {
                        children: [{ children: [{ bold: true, text: 'Improvement' }], type: 'p' }],
                        type: 'th',
                    },
                ],
                type: 'tr',
            },
            {
                children: [
                    {
                        children: [{ children: [{ text: 'Engagement Rate' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '2.3%' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '4.7%' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '+104%' }], type: 'p' }],
                        type: 'td',
                    },
                ],
                type: 'tr',
            },
            {
                children: [
                    {
                        children: [{ children: [{ text: 'Click-through Rate' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '1.8%' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '3.2%' }], type: 'p' }],
                        type: 'td',
                    },
                    {
                        children: [{ children: [{ text: '+78%' }], type: 'p' }],
                        type: 'td',
                    },
                ],
                type: 'tr',
            },
        ],
        type: 'table',
    },

    // Skills Section
    {
        children: [{ text: '💻 Technical Skills' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'Programming Languages: ' },
            { code: true, text: 'Python' },
            { text: ', ' },
            { code: true, text: 'R' },
            { text: ', ' },
            { code: true, text: 'SQL' },
            { text: ', ' },
            { code: true, text: 'JavaScript' },
        ],
        type: 'p',
    },
    {
        children: [
            { text: 'Data Science Libraries: ' },
            { code: true, text: 'Pandas' },
            { text: ', ' },
            { code: true, text: 'NumPy' },
            { text: ', ' },
            { code: true, text: 'Scikit-learn' },
            { text: ', ' },
            { code: true, text: 'TensorFlow' },
            { text: ', ' },
            { code: true, text: 'PyTorch' },
        ],
        type: 'p',
    },
    {
        children: [
            { text: 'Visualization Tools: ' },
            { code: true, text: 'Matplotlib' },
            { text: ', ' },
            { code: true, text: 'Seaborn' },
            { text: ', ' },
            { code: true, text: 'Plotly' },
            { text: ', ' },
            { code: true, text: 'Tableau' },
            { text: ', ' },
            { code: true, text: 'Power BI' },
        ],
        type: 'p',
    },

    // AI Integration Demo
    {
        children: [{ text: '🤖 AI-Powered Analysis' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'Using the platform\'s AI features, I can quickly generate insights and explanations. Press ' },
            { kbd: true, text: '⌘+J' },
            { text: ' to see AI suggestions in action!' },
        ],
        type: 'p',
    },

    // Contact/Links Section
    {
        children: [{ text: '🔗 Connect With Me' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'GitHub: ' },
            {
                children: [{ text: 'github.com/blackowl-datascience' }],
                type: 'a',
                url: 'https://github.com/blackowl-datascience'
            },
        ],
        type: 'p',
    },
    {
        children: [
            { text: 'LinkedIn: ' },
            {
                children: [{ text: 'linkedin.com/in/blackowl-analytics' }],
                type: 'a',
                url: 'https://linkedin.com/in/blackowl-analytics'
            },
        ],
        type: 'p',
    },
    {
        children: [
            { text: 'Portfolio: ' },
            {
                children: [{ text: 'blackowl-datascience.portfolio.com' }],
                type: 'a',
                url: 'https://blackowl-datascience.portfolio.com'
            },
        ],
        type: 'p',
    },
];

export const webDevPortfolioContent = [
    {
        children: [{ text: '💻 Black Owls Web Development Portfolio' }],
        type: 'h1',
    },
    {
        children: [
            { text: 'Full-stack web applications and frontend experiences built during the Code Academy Berlin Web Development Bootcamp.' },
        ],
        type: 'p',
    },

    // Project 1: E-commerce Platform
    {
        children: [{ text: '🛍️ E-Commerce Platform' }],
        type: 'h2',
    },
    {
        children: [
            { text: 'Built a complete e-commerce platform using React, Node.js, and MongoDB. Features include user authentication, payment processing, and real-time inventory management.' },
        ],
        type: 'p',
    },

    // Tech Stack
    {
        children: [
            { text: 'Frontend: ' },
            { code: true, text: 'React' },
            { text: ', ' },
            { code: true, text: 'TypeScript' },
            { text: ', ' },
            { code: true, text: 'Tailwind CSS' },
        ],
        type: 'p',
    },
    {
        children: [
            { text: 'Backend: ' },
            { code: true, text: 'Node.js' },
            { text: ', ' },
            { code: true, text: 'Express' },
            { text: ', ' },
            { code: true, text: 'MongoDB' },
        ],
        type: 'p',
    },

    // Code example
    {
        children: [
            { children: [{ text: '// Modern React with hooks' }], type: 'code_line' },
            { children: [{ text: 'const ShoppingCart = () => {' }], type: 'code_line' },
            { children: [{ text: '  const [items, setItems] = useState([]);' }], type: 'code_line' },
            { children: [{ text: '  const [total, setTotal] = useState(0);' }], type: 'code_line' },
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: '  useEffect(() => {' }], type: 'code_line' },
            { children: [{ text: '    calculateTotal();' }], type: 'code_line' },
            { children: [{ text: '  }, [items]);' }], type: 'code_line' },
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: '  return (' }], type: 'code_line' },
            { children: [{ text: '    <div className="cart-container">' }], type: 'code_line' },
            { children: [{ text: '      {items.map(item => <CartItem key={item.id} {...item} />)}' }], type: 'code_line' },
            { children: [{ text: '    </div>' }], type: 'code_line' },
            { children: [{ text: '  );' }], type: 'code_line' },
            { children: [{ text: '};' }], type: 'code_line' },
        ],
        lang: 'typescript',
        type: 'code_block',
    },
]; 