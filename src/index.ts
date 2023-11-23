import app from './app'

app.listen(process.env.PORT, () => {
    console.log('Server is up on port ' + (process.env.PORT ? process.env.PORT : 3000))
})