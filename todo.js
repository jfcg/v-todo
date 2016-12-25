// Author: Serhat Şevki Dinçer <jfcgauss@gmail.com>

function _tdUniq(o, td) {
	if (o.name === td) {
		return false
	}
	for (i=o.list.length-1; i>=0; i--) {
		x = o.list[i]
		if (x.constructor === Object) {
			x = x.name
		}
		if (td === x) {
			return false
		}
	}
	return true
}

function _tdSure(o) {
	msg = 'Are you sure?'
	if (o.todo === msg) {
		return true
	}
	o.todo = msg
	return false
}

Vue.component('todolist', {
	props: {
		'tdobj': {
			type: Object,
			validator(o) {
				return o.name.constructor === String && o.name.length > 0 && o.list.constructor === Array
			},
		},
	},
	created() {
		Vue.set(this.tdobj, 'todo', '')
	},
	components: {
		'tditem': { // single todo item
			props: ['tdobj'],
			template:
			`<span>{{tdobj}}
				<slot name="moveup"/><slot name="delete"/><slot name="mklist"/>
			</span>`
		},
	},
	template:
	`<div class="todolist"><span>{{tdobj.name}} :
		<slot name="moveup"/><slot name="delete"/><slot name="mkitem"/>
		<input title="Change list name with name:NewName" placeholder="Add a todo" v-model.trim="tdobj.todo" @keyup.enter="addNew(tdobj)">
	</span><ol><li v-for="(td, ix) in tdobj.list">
		<component :tdobj="td" :is="td.constructor === String ? 'tditem' : 'todolist'">
			<button slot="delete" title="delete"  @click="remove(ix,td)">x</button>
			<button slot="moveup" title="move up" @click="swap(ix,tdobj.list)" v-show="ix>0">^</button>
			<button slot="mkitem" title="make an item" @click="item(ix,td)">I</button>
			<button slot="mklist" title="make a list"  @click="update(ix, {name:td, list:[]})">L</button>
		</component>
	</li></ol></div>`,
	methods: {
		addNew(o) { // add new todo item
			td = o.todo
			if (td.length <= 0) {
				return
			}

			ls = td.length > 5 ? td.split(':') : []

			if (ls.length === 2 && ls[0] === 'name') { // update todo list name ?

				if (_tdUniq(o, ls[1])) { // check if in o.list ? how about parent.list ?
					o.name = ls[1]
				}
			} else if (_tdUniq(o, td)) {
				o.list.push(td)
			}
			o.todo = ''
		},
		remove(ix, td) { // remove item or sub-list
			if (td.constructor === Object && td.list.length > 1 && !_tdSure(td)) {
				return
			}
			this.tdobj.list.splice(ix,1)
		},
		swap(ix, ls) {
			t = ls[ix-1]
			ls[ix-1] = ls[ix]
			this.update(ix, t)
		},
		update(ix, td) {
			Vue.set(this.tdobj.list, ix, td)
		},
		item(ix, td) { // make todo list an item
			if (td.list.length > 1 && !_tdSure(td)) {
				return
			}
			this.update(ix, td.name)
		},
	},
})
