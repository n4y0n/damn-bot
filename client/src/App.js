const App = () => {
    const {initialData} = useContext(Context);
    const [data, setData] = useState(initialData);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('/api');
            setData(response.data);
        };
        if (!data) {
            fetchData();
        }
    }, [data]);

    return (
        <div>
            {data ? data : 'Loading...'}
        </div>
    );
};