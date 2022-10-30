export default ({initialData}) => {
    return (
        <BrowserRouter>
            <Context.Provider value={{initialData}}>
                <Route path='/' exact component={App}/>
            </Context.Provider>
        </BrowserRouter>
    );
};
