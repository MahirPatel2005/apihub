// Using native fetch (Node 18+)
const api = 'http://localhost:5001/api/apis';

const testApis = async () => {
    try {
        console.log('--- Getting All APIs ---');
        const res = await fetch(api);
        const data = await res.json();
        console.log('Status:', res.status);
        if (data.apis) {
            console.log('Count:', data.apis.length);
            console.log('First API:', data.apis[0]?.name);
        } else {
            console.log('Data:', data);
        }

        if (data.apis && data.apis.length > 0) {
            const id = data.apis[0]._id;
            console.log(`\n--- Getting API Details (${id}) ---`);
            const detailRes = await fetch(`${api}/${id}`);
            const detailData = await detailRes.json();
            console.log('Detail Status:', detailRes.status);
            console.log('Views:', detailData.stats?.views);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

testApis();
