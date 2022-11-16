const body = request.body

if (body.content === undefined) {
  return response.status(400).json({ error: 'content missing' })
}

const note = new Note({
  content: body.content,
  important: body.important || false,
  date: new Date(),
})

note.save().then(savedNote => {
  response.json(savedNote)
})


const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  })
  
  const Note = mongoose.model('Note', noteSchema)
  
  const note = new Note({
    content: 'HTML is Easy',
    date: new Date(),
    important: false,
  })
  
  note.save().then(result => {
    console.log('note saved!')
    mongoose.connection.close()
  })
  
  Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })
  
  noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })


//    Note.findByIdAndRemove(request.params.id)
    // .then(result => {
    //     response.status(204).end()
    //   })
    //   .catch(error => next(error))