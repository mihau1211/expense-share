import app from './app'
import env from './utils/envLoader'

app.listen(env.PORT, () => {
    console.log('Server is up on port ' + 3000)
})