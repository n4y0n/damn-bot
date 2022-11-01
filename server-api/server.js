const express = require('express');
const app = express();

app.get('*', (req, res) => {
    const store = createStore();
    // some logic to initialize and load data into the store
    const context = {};
    const content = renderToString(req, store, context);
    if (context.url) {
        return res.redirect(301, context.url);
    }
    if (context.notFound) {
        res.status(404);
    }
    res.send(content);
});

function renderToString(req, store, context) {
    const content = renderToString(
        <Provider store={store}>
            <StaticRouter location={req.path} context={context}>
                <Root/>
            </StaticRouter>
        </Provider>
    );
    return `
        <html>
            <head></head>
            <body>
                <div id="root">${content}</div>
                <script>
                    window.INITIAL_DATA = ${JSON.stringify(store.getState())}
                </script>
                <script src="bundle.js"></script>
            </body>
        </html>
    `;
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
